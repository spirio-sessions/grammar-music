export class Token {
  /**
   * @param {String} name 
   * @param {Object} value 
   */
  constructor(name, value) {
    this.name = name
    this.value = value
  }

  print() {
    return `${this.name}:${this.value.toString()}`
  }
}

export class Lexer {

  /**
  * @param {Dict<string, predicate>} rules
  */
  constructor(rules) {
    this.rules = rules
  }

  /**
   * @returns {Array<String>}
   */
  terminals() {
    return Object.keys(this.rules)
  }

  /**
   * @param {Object} obj 
   * @param {Number} index 
   * @returns {Token}
   */
  lex(obj, index) {
    let tokenName
    for (const name in this.rules) {
      const predicate = this.rules[name]
      if (predicate(obj)) {
        tokenName = name
        break
      }
    }

    if (tokenName === undefined)
      throw new Error(`no fitting phenotype rule for token ${index}`)

    return new Token(tokenName, obj)
  }

  /**
   * @param {...any} objs 
   * @returns {Array<Token>}
   */
  run(...objs) {
    return objs.map(this.lex, this)
  }

}
