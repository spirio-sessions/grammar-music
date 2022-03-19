import { isEmpty } from './util.mjs'
import { error } from './util.mjs'

class Production {
  /**
   * @param {String} lhs 
   * @param {Number} p 
   * @param {Array<String>} rhs 
   */
  constructor(lhs, p, rhs) {
    this.lhs = lhs
    this.p = p
    this.rhs = rhs
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

    productions = productions.map(p => new Production(p[0], p[1], p[2]))

    productions.forEach(prod => {
      if (!nonTerminals.includes(prod.lhs))
        error(`invalid lhs: ${prod.lhs}`)

      prod.rhs.forEach(symbol => {
        if (!nonTerminals.includes(symbol) && ![...terminals, null].includes(symbol))
          error(`invalid symbol in rhs: ${symbol}`)
      })
    })
    
    nonTerminals.forEach(nt => 
      this.productions[nt] = [])
    
    productions.forEach(prod => 
      this.productions[prod.lhs].push({p:prod.p, rhs:prod.rhs}))

    Object.values(this.productions).forEach(body =>
      body.sort((x, y) => y.p - x.p))
  }

  /**
  * @param {Array<String>} terminals 
  * @param {Array<Array>} productions
  * @returns {Grammar}
  */
  static from(terminals, productions) {
    if (isEmpty(terminals))
      error('no terminals provided')
    if (containsFalsyValue(terminals))
      error('terminals must no contain falsy values')

    if (isEmpty(productions))
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
