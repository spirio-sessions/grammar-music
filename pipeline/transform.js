import { Token } from '../parsing/lexer.mjs'
import { SyntaxTree, STLeaf, STNode, dft, STEmpty } from '../parsing/parser.mjs'

const id = thing => thing

// SyntaxTree => [Token]
export default {
  default: {
    tree: id,
    serialize: flatten
  },

  reverse: {
    tree: id,
    serialize: st => flatten(st).reverse()
  },

  'straight-to-swing': {
    tree: straight2swing,
    serialize: flatten
  },

  'swing-to-straight': {
    tree: swing2straight,
    serialize: flatten
  }
}

/**
 * @param {SyntaxTree} syntaxTree 
 * @returns {[Token]}
 */
function flatten(syntaxTree) {
    const output = []
    dft(syntaxTree, st => {
      if (st instanceof STLeaf && !(st instanceof STEmpty))
        output.push(st.token)
    })
    return output
}

const bpmToPeriodMs = bpm => 60000 / bpm

/**
 * @param {SyntaxTree} syntaxTree 
 * @returns {SyntaxTree}
 */
function straight2swing(syntaxTree) {
  dft(syntaxTree, st => {
    if (st instanceof STNode && st.label === 'STRAIGHT') {
      st.label = 'SWING'

      const tokenL = st.children[0].token
      const tokenR = st.children[1].token
      const beatPeriosMs = (bpmToPeriodMs(tokenL.lexem.bpm) * 2) / 3
      
      tokenL.lexem.noteValue = 2
      tokenL.lexem.duration = beatPeriosMs * 2
      tokenL.name = '2'

      tokenR.lexem.noteValue = 1
      tokenR.lexem.duration = beatPeriosMs
      tokenR.name = '1'
    }
  })

  return syntaxTree
}

/**
 * @param {SyntaxTree} syntaxTree 
 * @returns {SyntaxTree}
 */
function swing2straight(syntaxTree) {
  dft(syntaxTree, st => {
    if (st instanceof STNode && st.label === 'SWING') {
      st.label = 'STRAIGHT'

      const tokenL = st.children[0].token
      const tokenR = st.children[1].token
      const beatPeriodMs = bpmToPeriodMs(tokenL.lexem.bpm) * 1.5

      tokenL.lexem.noteValue = 1
      tokenL.lexem.duration = beatPeriodMs
      tokenL.name = '1'

      tokenR.lexem.noteValue = 1
      tokenR.lexem.duration = beatPeriodMs
      tokenR.name = '1'
    }
  })

  return syntaxTree
}
