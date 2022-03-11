import { SyntaxTree, STLeaf, STNode, dft } from '../parsing/parser.mjs'

export default {
  default: flatten,

  reverse: st => flatten(st).reverse()
}

function flatten(syntaxTree) {
    const output = []
    dft(syntaxTree, st => {
      if (st instanceof STLeaf)
        output.push(st.token.value)
    })
    return output
}
