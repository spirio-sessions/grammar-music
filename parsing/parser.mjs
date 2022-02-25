import { error, isEmpty } from './util.mjs'

import { Token } from './lexer.mjs'
import { Grammar } from './grammar.mjs'

export class AST {
  /**
   * @param {String} label 
   */
  constructor(label) {
    this.label = label
  }
}

export class ASTNode extends AST {
  /**
   * @param {String} label 
   * @param  {...AST} children 
   */
  constructor(label, ...children) {
    super(label)
    this.children = children
  }
}

export class ASTLeaf extends AST {
  /**
   * @param {String} label 
   * @param {Token} token 
   */
  constructor(label, token) {
    super(label)
    this.token = token
  }
}

/**
 * depth-first traversal of ASTs
 * no return value, side-effect only
 * @param {AST} ast 
 * @param {(AST) => undefined} cb 
 */
export function dft(ast, cb) {
  if (ast instanceof ASTLeaf)
    cb(ast)
  else if (ast instanceof ASTNode) {
    cb(ast)
    for (const c of ast.children)
      dft(c, cb)
  }
  else
    error('input is not an AST')
}

/**
 * breadth-first traversal of ASTs
 * no return value, side-effect only
 * @param {AST} ast 
 * @param {(AST) => undefined} cb 
 */
export function bft(ast, cb) {
  const queue = [ast]

  iter()

  function iter() {
    if (isEmpty(queue))
      return

    const ast = queue.shift()

    if (ast instanceof ASTLeaf) {
      cb(ast)
      iter()
    }
    else if (ast instanceof ASTNode) {
      cb(ast)
      for (const c of ast.children)
        queue.push(c)
      iter()
    }
    else
      error('input is not an AST')  
  }
}

/**
 * @param {AST} ast
 * @param {'json'|'dot'} format 
 */
export function printAST(ast, format = 'json') {
  switch (format) {
    case 'json':
      return JSON.stringify(this, null, 2)

    case 'dot':
      return printDot(ast)

    default:
      throw new Error('unknown print format')
  }

  function printDot(ast) {
    const start = 'graph G {'
    let i = 0
    let defs = '', leafs = []
    const end = '\n}'

    bft(ast, ast => ast.i = i++)

    bft(ast, ast => {
      if (ast instanceof ASTNode) {
        defs += `\n  { n${ast.i} [label=${ast.label}] }`
        for (const c of ast.children)
          defs += `\n  n${ast.i} -- n${c.i} ;`
      } else if (ast instanceof ASTLeaf){
        leafs.push(ast)
      }
    })

    const leafAttrs = leafs.map(l => `  { n${l.i} [label=${l.label} shape=none] }`)
    const leafNodes = leafs.map(l => `n${l.i}`)
    const leafRank = `  { rank=same ; ${leafNodes.join(' ; ')} }`

    return [ start, defs, '', ...leafAttrs, '', leafRank, end ].join('\n')
  }
}

/**
 * convenient wrapper function for parser result passing
 * @param {AST} ast 
 * @param {Integer} index 
 * @returns {{AST,Integer}}
 */
function result(ast, index) {
  return {
    ast: ast,
    index: index
  }
}

export class Parser {

  /**
   * @param {Grammar} grammar 
   */
  constructor(grammar) {
    this.grammar = grammar
    this.tokens = null
  }

  /**
   * @param {String} symbol 
   * @returns {Boolean}
   */
  isTerminal(symbol) {
    return this.grammar.terminals.has(symbol)
  }

  /**
   * @param {String} symbol 
   * @returns {Boolean}
   */
  isNonTerminal(symbol) {
    return this.grammar.nonTerminals.has(symbol)
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{AST,Integer}}
   */
  parse(symbol, index) {
    if (this.isTerminal(symbol))
      return this.parseT(symbol, index)

    if (this.isNonTerminal(symbol))
      return this.parseNT(symbol, index)

    error(`unknown symbol '${symbol}' at position ${index}`)
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{AST,Integer}}
   */
  parseT(symbol, index) {
    if (index >= this.tokens.length)
      return false

    const token = this.tokens[index]

    if (token.name === symbol)
      return result(new ASTLeaf(symbol, token), index+1)
    else
      return false
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{AST,Integer}}
   */
  parseNT(symbol, index) {
    let res
    const production = this.grammar.productions[symbol]

    for (const body of production) {
      if (body.rhs.length > 1) {
        res = this.parseSeq(body.rhs, index)
        if (res)
          return result(new ASTNode(symbol, ...res.ast), res.index)
      }
      else {
        res = this.parse(body.rhs[0], index)
        if (res)
          return result(new ASTNode(symbol, res.ast), res.index)
      }
    }

    return false
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{AST,Integer}}
   */
  parseSeq(rhs, index) {
    const children = []
    let i = index, res

    for (const symbol of rhs) {
      res = this.parse(symbol, i)
      
      if (!res)
        return false
      else {
        children.push(res.ast)
        i = res.index
      }
    }

    return result(children, i)
  }

  /**
   * @param {...Token} tokens
   * @returns {{AST,Integer}} 
   */
  run(...tokens) {
    if (isEmpty(tokens))
      throw new Error('empty parser input')

    this.tokens = tokens
    return this.parse('S', 0)
  }

}
