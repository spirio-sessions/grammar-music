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

export class STEmpty extends STLeaf{
  constructor() {
    super('empty', new Token('e', '⌀'))
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
 * convenient wrapper function for passing a successful parser result
 * @param {SyntaxTree} st 
 * @param {Integer} index 
 * @returns {{success:true,st:SyntaxTree,index:Integer}}
 */
function succeed(st, index) {
  return {
    success: true,
    st: st,
    index: index
  }
}

/**
 * convenient wrapper function for passing a successful parser result
 * @param {String} symbol 
 * @param {Integer} index 
 * @returns {{success:true,st:SyntaxTree,index:Integer}}
 */
function fail(symbol, index, reason='') {
  return {
    success: false,
    symbol: symbol,
    index: index,
    reason: reason
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
   * @returns {Boolean}
   */
  isEmptySymbol(symbol) {
    return symbol === null
  }

  // TODO: check for empty ST and correctly construct effective ST
  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{success:boolean,index:number,}}
   */
  parse(symbol, index) {
    if (this.isTerminal(symbol))
      return this.parseT(symbol, index)

    if (this.isNonTerminal(symbol))
      return this.parseNT(symbol, index)

    if (this.isEmptySymbol(symbol))
      return succeed(new STEmpty(), index)

    return fail(symbol, index, 'invalid symbol')
  }

  /**
   * @param {String} symbol 
   * @param {Integer} index 
   * @returns {{SyntaxTree,Integer}}
   */
  parseT(symbol, index) {
    if (index >= this.tokens.length)
      return fail(symbol, index, 'index out of bounds')

    const token = this.tokens[index]

    if (token.name === symbol)
      return succeed(new STLeaf(symbol, token), index+1)
    else
      return fail(symbol, index, 'terminal does not match')
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
        if (res.success)
          return succeed(new STNode(symbol, ...res.st), res.index)
      }
      else {
        res = this.parse(body.rhs[0], index)
        if (res.success)
          return succeed(new STNode(symbol, res.st), res.index)
      }
    }

    return fail(symbol, index, 'all productions exhausted')
  }

  /**
   * @param {Array<String>} rhs 
   * @param {Integer} index 
   * @returns {{SyntaxTree,Integer}}
   */
  parseSeq(rhs, index) {
    const children = []
    let i = index, res

    for (const symbol of rhs) {
      res = this.parse(symbol, i)
      
      if (!res.success)
        return fail(symbol, i, `mismatch in right hand side sequence [${rhs.join(',')}]`)
      else {
        children.push(res.st)
        i = res.index
      }
    }

    return succeed(children, i)
  }

  /**
   * @param {...Token} tokens
   * @returns {{st:SyntaxTree,index:Integer}} 
   */
  run(...tokens) {
    if (isEmpty(tokens))
      throw new Error('empty parser input')

    this.tokens = tokens
    const result = this.parse('S', 0)
    
    if (!result.success)
      throw new Error(`parsing failed at position ${result.index} for symbol '${result.symbol}': ${result.reason}`)
    else
      return result
  }
}
