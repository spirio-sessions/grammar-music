import { error, isEmpty } from './util.mjs'

import { Token } from './lexer.mjs'
import { Grammar } from './grammar.mjs'

export class SyntaxTree {
  /**
   * @param {String} label 
   */
  constructor(label) {
    this.label = label
  }
}

export class STNode extends SyntaxTree {
  /**
   * @param {String} label 
   * @param  {...SyntaxTree} children 
   */
  constructor(label, ...children) {
    super(label)
    this.children = children
  }
}

export class STLeaf extends SyntaxTree {
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
 * depth-first traversal of SyntaxTrees
 * no return value, side-effect only
 * @param {SyntaxTree} st 
 * @param {(SyntaxTree) => undefined} cb 
 */
export function dft(st, cb) {
  if (st instanceof STLeaf)
    cb(st)
  else if (st instanceof STNode) {
    cb(st)
    for (const c of st.children)
      dft(c, cb)
  }
  else
    error('input is not a SyntaxTree')
}

/**
 * breadth-first traversal of SyntaxTrees
 * no return value, side-effect only
 * @param {SyntaxTree} st 
 * @param {(SyntaxTree) => undefined} cb 
 */
export function bft(st, cb) {
  const queue = [st]

  iter()

  function iter() {
    if (isEmpty(queue))
      return

    const st = queue.shift()

    if (st instanceof STLeaf) {
      cb(st)
      iter()
    }
    else if (st instanceof STNode) {
      cb(st)
      for (const c of st.children)
        queue.push(c)
      iter()
    }
    else
      error('input is not a SyntaxTree')  
  }
}

/**
 * @param {SyntaxTree} st
 * @param {'json'|'dot'} format 
 */
export function printST(st, format = 'json') {
  switch (format) {
    case 'json':
      return JSON.stringify(this, null, 2)

    case 'dot':
      return printDot(st)

    default:
      throw new Error('unknown print format')
  }

  function printDot(st) {
    const start = 'graph G {\n  size="6.25,4.16";'
    let i = 0
    let defs = '', leafs = []
    const end = '\n}'

    bft(st, st => st.i = i++)

    bft(st, st => {
      if (st instanceof STNode) {
        defs += `\n  { n${st.i} [label=${st.label}] }`
        for (const c of st.children)
          defs += `\n  n${st.i} -- n${c.i} ;`
      } else if (st instanceof STLeaf){
        leafs.push(st)
      }
    })

    const leafAttrs = leafs.map(l => `  { n${l.i} [label="${l.token.print()}" shape=none] }`)
    const leafNodes = leafs.map(l => `n${l.i}`)
    const leafRank = `  { rank=same ; ${leafNodes.join(' ; ')} }`

    return [ start, defs, '', ...leafAttrs, '', leafRank, end ].join('\n')
  }
}

/**
 * convenient wrapper function for parser result passing
 * @param {SyntaxTree} st 
 * @param {Integer} index 
 * @returns {{st:SyntaxTree,index:Integer}}
 */
function result(st, index) {
  return {
    st: st,
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
   * @returns {{SyntaxTree,Integer}}
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
   * @returns {{SyntaxTree,Integer}}
   */
  parseT(symbol, index) {
    if (index >= this.tokens.length)
      return false

    const token = this.tokens[index]

    if (token.name === symbol)
      return result(new STLeaf(symbol, token), index+1)
    else
      return false
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{SyntaxTree,Integer}}
   */
  parseNT(symbol, index) {
    let res
    const production = this.grammar.productions[symbol]

    for (const body of production) {
      if (body.rhs.length > 1) {
        res = this.parseSeq(body.rhs, index)
        if (res)
          return result(new STNode(symbol, ...res.st), res.index)
      }
      else {
        res = this.parse(body.rhs[0], index)
        if (res)
          return result(new STNode(symbol, res.st), res.index)
      }
    }

    return false
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{SyntaxTree,Integer}}
   */
  parseSeq(rhs, index) {
    const children = []
    let i = index, res

    for (const symbol of rhs) {
      res = this.parse(symbol, i)
      
      if (!res)
        return false
      else {
        children.push(res.st)
        i = res.index
      }
    }

    return result(children, i)
  }

  /**
   * @param {...Token} tokens
   * @returns {{st:SyntaxTree,index:Integer}} 
   */
  run(...tokens) {
    if (isEmpty(tokens))
      throw new Error('empty parser input')

    this.tokens = tokens
    return this.parse('S', 0)
  }

}
