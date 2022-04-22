import { Lexem } from '../util/midi-handling.js'
import { SyntaxTree, dft, ASTNode, ASTLeaf, AbstractSyntaxTree, copyTree } from '../parsing/tree.mjs'
import { randomChoice } from '../util/util.js'

const id = thing => thing

const bpmToPeriodMs = bpm => 60000 / bpm

//#region tree transformations

/**
 * modifies input
 * @param {AbstractSyntaxTree} ast
 * @returns {AbstractSyntaxTree}
 */
function shuffleRec(ast) {
  dft(ast, ast => {
    if (ast instanceof ASTNode)
      ast.children.shuffle()
  })

  return ast
}

/**
 * @param {ASTNode} ast root AST node
 * @returns {ASTNode}
 */
function shuffleRoot(ast) {
  if (ast instanceof ASTNode)
    ast.children.shuffle()
  
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

/**
 * probabilistically drop subtree
 * @param {Object.<string,number>} weightedSelectors
 * @returns {(ast:ASTNode)=>ASTNode}
 */
function mkDropSubTrees(weightedSelectors) {
  return ast => {
    if (!ast instanceof ASTNode)
      return ast

    for (let i = 0; i < ast.children.length; i++) {
      if (!weightedSelectors)
        dropProbabilistically()

      else
        Object.keys(weightedSelectors).forEach(label => {
          if (label === ast.children[i].label) {
            dropProbabilistically(weightedSelectors[label])
            return
          }
        })

      function dropProbabilistically(w) {
        if (randomChoice(w))
          ast.children[i] = undefined
      }
    }

    ast.children = ast.children.filter(c => c !== undefined)

    return ast
  }
}

/**
 * probabilistically drop subtree
 * @param {Object.<string,number>} weightedSelectors
 * @returns {(ast:ASTNode)=>ASTNode}
 */
function mkDoubleSubTrees(weightedSelectors) {
  return ast => {
    if (!ast instanceof ASTNode)
      return ast
    
    const newChildren = []
    
    ast.children.forEach(c => {
      newChildren.push(c)

      if (!weightedSelectors)
        doubleProbabilistically()
      
      else
        Object.keys(weightedSelectors).forEach(label => {
          if (label === c.label) {
            doubleProbabilistically(weightedSelectors[label])
            return
          }
        })
      
      function doubleProbabilistically(w) {
        if (randomChoice(w)) {
          const subTreeCopy = copyTree(c)
          newChildren.push(subTreeCopy)
        }
      }
    })

    ast.children = newChildren

    return ast
  }
}

/**
 * apply AST transformations to AST members where matchLabel matches member's label
 * modifies AST
 * @param {{matchLabel:(ast:AbstractSyntaxTree)=>AbstractSyntaxTree}} config 
 * @returns {(ast:AbstractSyntaxTree)=>AbstractSyntaxTree}
 */
function matchTransform(config) {
  return ast => {
    
    dft(ast, ast => {
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

  'flat-reverse': {
    tree: id,
    serialize: st => flatten(st).reverse()
  },

  'shuffle-rec': {
    tree: shuffleRec,
    serialize: flatten
  },

  'shuffle-root': {
    tree: shuffleRoot,
    serialize: flatten
  },

  'drop-root-sub': {
    tree: mkDropSubTrees(),
    serialize: flatten
  },

  'drop-root-tones': {
    tree: mkDropSubTrees({tone: Infinity}),
    serialize: flatten
  },

  'double-root-sub': {
    tree: mkDoubleSubTrees(),
    serialize: flatten
  },

  'rhythm-straight2swing': {
    tree: straight2swing,
    serialize: flatten
  },

  'double-root-tones': {
    tree: mkDoubleSubTrees({tone: Infinity}),
    serialize: flatten
  }
}
