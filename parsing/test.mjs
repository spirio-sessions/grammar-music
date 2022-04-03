import lexerRules from './lex.mjs'
import { Lexer } from './lexer.mjs'
import productionRules from './prod.mjs'
import { Grammar } from './grammar.mjs'
import { Parser } from './parser.mjs'

const lexer = new Lexer(lexerRules)
const terminals = lexer.terminals()
const grammar = Grammar.from(terminals, productionRules)
const parser = new Parser(grammar)

const lexems = ['b', 'b', 'a', 'b', 'b']
const tokens = lexer.run(...lexems)
const { st } = parser.run(...tokens)
const ast = st.transformAST(st)

console.log(JSON.stringify(ast, null, 4))
