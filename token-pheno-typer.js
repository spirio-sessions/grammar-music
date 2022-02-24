class Token {
  constructor(name, terminal) {
    this.name = name
    this.terminal = terminal
  }
}

class TerminalPhenoTyper {

  /**
  * @constructor
  * @param {Dict<string, predicate>} rules
  * @returns {TerminalPhenoTyper}
  */
  constructor(rules) {
    this.rules = rules
  }

  /**
   * @param {Object} terminal 
   * @param {Number} index 
   * @returns {Token}
   */
  phenotypeTerminal(terminal, index) {
    let tokenName
    for (const name in rules) {
      const predicate = rules[name]
      if (predicate(terminal)) {
        tokenName = name
        break
      }
    }

    if (tokenName === undefined)
      throw new Error(`no fitting phenotype rule for token ${index}`)

    return new Token(tokenName, terminal)
  }

  run(...terminals) {
    return terminals.map(this.phenotypeTerminal)
  }

}
