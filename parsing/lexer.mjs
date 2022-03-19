export class Token {
  /**
   * @param {String} name 
   * @param {Object} lexem 
   */
  constructor(name, lexem) {
    this.name = name
    this.lexem = lexem
  }

  print() {
    return `${this.name}:${this.lexem.toString()}`
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
  lexOne(obj, index) {
    let tokenName
    for (const name in this.rules) {
      const predicate = this.rules[name]
      if (predicate(obj)) {
        tokenName = name
        break
      }
    }

    if (tokenName === undefined)
      throw new Error(`no fitting lexer rule for token ${index}`)

    return new Token(tokenName, obj)
  }

  /**
   * @param {...any} objs 
   * @returns {Array<Token>}
   */
  run(...objs) {
    return objs.map((o, i) => this.lexOne(o, i))
  }
}
