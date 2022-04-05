import { Lexem } from '../util/midi-handling.js'
import { SyntaxTree, dft, ASTNode, ASTLeaf } from '../parsing/tree.mjs'

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
  }
}

/**
 * @param {SyntaxTree} ast 
 * @returns {[Lexem]}
 */
function flatten(ast) {
    const output = []
    dft(ast, ast => {
      if (ast instanceof ASTLeaf)
        output.push(ast.value)
    })
    return output
}

const bpmToPeriodMs = bpm => 60000 / bpm

/**
 * @param {SyntaxTree} syntaxTree 
 * @returns {SyntaxTree}
 */
function straight2swing(syntaxTree) {
  dft(syntaxTree, ast => {
    if (ast instanceof ASTNode && ast.label === 'STRAIGHT') {
      ast.label = 'SWING'

      const lexemL = ast.children[0].value
      const lexemR = ast.children[1].value
      const beatPeriosMs = lexemL.noteValue * (bpmToPeriodMs(lexemL.bpm) * 2) / 3
      
      lexemL.noteValue = 2
      lexemL.duration = beatPeriosMs * 2
      ast.children[0].label = '2'

      lexemR.noteValue = 1
      lexemR.duration = beatPeriosMs
      ast.children[1].label = '1'
    }
  })

  return syntaxTree
}
