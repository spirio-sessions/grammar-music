let readIndex = 0

import { analyse } from './analyse.js'

export async function transformTransfer(tokenDump, destination, renderTokens, renderTree) {
  const call = tokenDump.slice(readIndex)

  // exit if dump didn't grow
  if (call.length === 0)
    return

  readIndex = tokenDump.length

  let bpm, annotated
  ({ bpm, annotated } = analyse(call))
  
  console.log(`${bpm} bpm`)
  renderTokens(annotated)

  const st = parse(annotated)
  renderTree(st)

  const response = annotated
  await transfer(response, destination)
}

import lexRules from './parsing/lex.mjs'
import productions from './parsing/prod.mjs'
import { Lexer } from './parsing/lexer.mjs'
import { Grammar } from './parsing/grammar.mjs'
import { Parser } from './parsing/parser.mjs'

const lexer = new Lexer(lexRules)
const terminals = lexer.terminals()
const grammar = Grammar.from(terminals, productions)
const parser = new Parser(grammar)

/**
 * Parse tokens to syntax tree representation.
 * @param {Array<Token>} tokens 
 * @returns {SyntaxTree}
 */
function parse(tokens) {
  const grammarTokens = lexer.run(...tokens)
  const result = parser.run(...grammarTokens)

  if (result)
    return result.st
  else
    throw new Error('error while parsing')
}



import { sleep } from './util.js'
import { Rest, Tone } from './tokenize.js'
import { SyntaxTree } from './parsing/parser.mjs'

async function transfer(tokens, destination) {
  // send tones to midi input device 'destination'

  for (const token of tokens) {
    const now = Math.round(performance.now())

    // handle rest
    if (token instanceof Rest) {
      console.log(token.serialize())
      await sleep(token.duration)
    }
    // handle tone
    else if (token instanceof Tone) {
      const noteOn = [0x90, token.noteNumber, token.velocity]
      const noteOff = [0x80, token.noteNumber, 0]
  
      console.log(token.serialize())

      destination.send(noteOn)
      await sleep(token.duration)
      destination.send(noteOff)
    }
    else {
      console.log(`${now} unkown token`)
    }
  }
}
