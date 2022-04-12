import { Lexem } from '../util/midi-handling.js'
import { SyntaxTree, dft, ASTNode, ASTLeaf, AbstractSyntaxTree } from '../parsing/tree.mjs'
import { error } from '../parsing/util.mjs'

const id = thing => thing

const bpmToPeriodMs = bpm => 60000 / bpm

/**
 * modern Fisher-Yates array shuffle, modifies array
 * @param {Array} array 
 * @returns {void}
 */
function shuffle(array) {
  if (!Array.isArray(array))
    error('input must be array')
  if (array.length < 2)
    return array

  let currentIndex = array.length, randomIndex

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
  }
}

//#region tree transformations

/**
 * modifies input
 * @param {AbstractSyntaxTree} ast
 * @returns {AbstractSyntaxTree}
 */
function shuffleChildren(ast) {
  dft(ast, ast => {
    if (ast instanceof ASTNode)
      shuffle(ast.children)
  })

  return ast
}

/**
 * straight rhythm -> swinged rhythm, modifies input AST
 * @param {AbstractSyntaxTree} ast 
 * @returns {AbstractSyntaxTree}
 */
function straight2swing(ast) {
  dft(ast, ast => {
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

  return ast
}

// TODO: test this
/**
 * apply AST transformations to AST members where matchLabel matches member's label
 * modifies AST
 * @param {{matchLabel:(ast:AbstractSyntaxTree)=>AbstractSyntaxTree}} config 
 * @returns {(ast:AbstractSyntaxTree)=>AbstractSyntaxTree}
 */
function matchTransform(config) {
  return ast => {
    
    dft(ast => {
      for (const matchLabel of Object.keys(config)) {
        if (ast.label === matchLabel) {
          const transform = config[matchLabel]
          transform(ast)
          return
        }
      }
    })

    return ast
  }
}

const appendCountMore = {
  'MORE': node => node.children.push(new ASTLeaf(node.children.length.toString(), node.children.length))
}

// TODO: implement motivic transformations via matchTransform (?)

//#endregion

//#region serialization

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

//#endregion

// tree :: AbstractSyntaxTree => AbstractSyntaxTree
// serialize :: AbstractSyntaxTree => [Lexem]
export default {
  default: {
    tree: id,
    serialize: flatten
  },

  reverse: {
    tree: id,
    serialize: st => flatten(st).reverse()
  },

  shuffle: {
    tree: shuffleChildren,
    serialize: flatten
  },

  'straight-to-swing': {
    tree: straight2swing,
    serialize: flatten
  },

  'append-child-count-more': {
    tree: matchTransform(appendCountMore),
    serialize: flatten
  }
}
