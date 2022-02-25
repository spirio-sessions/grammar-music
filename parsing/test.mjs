import lexRules from './lex.mjs'
import productions from './prod.mjs'
import { Lexer } from './lexer.mjs'
import { Grammar } from './grammar.mjs'
import { Parser , printAST } from './parser.mjs'

const lexer = new Lexer(lexRules)
const terminals = lexer.terminals()
const grammar = Grammar.from(terminals, productions)
const parser = new Parser(grammar)

const input = [ 1, 2, 3, 2, 1, 'this', 'is', 'the', 'end' ]
// const input = [ 'odd', 'text' ]
const tokens = lexer.run(...input)
const res = parser.run(...tokens)

if (res)
  console.log(printAST(res.ast, 'dot'))