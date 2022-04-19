import { error } from '../util/util.js'
import { contractR, bubbleOne } from './tree.mjs'

class Production {
  /**
   * @param {String} lhs 
   * @param {Number} w 
   * @param {Array<String>} rhs 
   */
  constructor(lhs, w, rhs, t) {
    this.lhs = lhs
    this.w = w
    this.rhs = rhs
    this.t = t ??
      (this.#isRightExpanding() ? contractR :
      this.#isSingleChild() ? bubbleOne :
      undefined)
  }

  #isRightExpanding() {
    return this.rhs.length > 1 && this.rhs.at(-1) === this.lhs
  }

  #isSingleChild() {
    return this.rhs.length === 1
  }
}

export class Grammar {
  /**
   * @param {Array<String>} terminals 
   * @param {Array<String>} nonTerminals 
   * @param {Array<Array>} productions 
   */
  constructor(terminals, nonTerminals, productions) {
    this.terminals = new Set(terminals)
    this.nonTerminals = new Set(nonTerminals)
    this.productions = {}

    productions = productions.map(p => new Production(...p))

    productions.forEach(prod => {
      if (!nonTerminals.includes(prod.lhs))
        error(`invalid lhs: ${prod.lhs}`)

      prod.rhs.forEach(symbol => {
        if (!nonTerminals.includes(symbol) && ![...terminals, null, '*'].includes(symbol))
          error(`invalid symbol in rhs: ${symbol}`)
      })
    })
    
    nonTerminals.forEach(nt => 
      this.productions[nt] = [])
    
    productions.forEach(prod => 
      this.productions[prod.lhs].push({w:prod.w, rhs:prod.rhs, t:prod.t}))

    Object.values(this.productions).forEach(body =>
      body.sort((x, y) => y.w - x.w))
  }

  /**
  * @param {Array<String>} terminals 
  * @param {Array<Array>} productions
  * @returns {Grammar}
  */
  static from(terminals, productions) {
    if (terminals.isEmpty())
      error('no terminals provided')
    if (containsFalsyValue(terminals))
      error('terminals must no contain falsy values')

    if (productions.isEmpty())
      error('no productions provided')
    if (containsFalsyValue(productions))
      error('productions may not contain falsy values')

    const nonTerminals = productions.map(p => p[0])
    if (containsFalsyValue(nonTerminals))
      error('non-terminals may not contain falsy values')

    return new Grammar(terminals, nonTerminals, productions)

    function containsFalsyValue(array) {
      return array.includes(undefined)
        || array.includes(null) 
        || array.includes(false)
    }
  }
}
