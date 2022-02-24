class Token {
  constructor(name, terminal) {
    this.name = name
    this.terminal = terminal
  }
}

/**
 * rules {object of named predicates}
 */
class TerminalPhenoTyper {

  constructor(rules) {
    this.rules = rules
  }

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
