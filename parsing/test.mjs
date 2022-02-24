import lexRules from './lex.mjs'
import productions from './prod.mjs'
import { Lexer } from './lexer.mjs'
import { Grammar } from './grammar.mjs'
import { Parser } from './parser.mjs'

const lexer = new Lexer(lexRules)
const terminals = lexer.terminals()
const grammar = Grammar.from(terminals, productions)
const parser = new Parser(grammar)

const input = [ 'a', 'b', 'lol', 'a' ]
const tokens = lexer.run(...input)
const res = parser.run(...tokens)

console.log(JSON.stringify(res, null, 2))
