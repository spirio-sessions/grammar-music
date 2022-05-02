import { Interval, Lexem, Tone } from '../util/midi-handling.js'
import { SyntaxTree, dft, ASTNode, ASTLeaf, AbstractSyntaxTree, copyTree } from '../parsing/tree.mjs'
import { id, randomChoice } from '../util/util.js'

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
  return node => {
    if (!node instanceof ASTNode)
      return node

    for (let i = 0; i < node.children.length; i++) {
      if (!weightedSelectors)
        dropProbabilistically()

      else
        Object.keys(weightedSelectors).forEach(label => {
          if (label === node.children[i].label) {
            dropProbabilistically(weightedSelectors[label])
            return
          }
        })

      function dropProbabilistically(w) {
        if (randomChoice(w))
          node.children[i] = undefined
      }
    }

    node.children = node.children.filter(c => c !== undefined)

    return node
  }
}

/**
 * probabilistically drop subtree
 * @param {Object.<string,number>} weightedSelectors
 * @returns {(ast:ASTNode)=>ASTNode}
 */
function mkDoubleSubTrees(weightedSelectors) {
  return node => {
    if (!node instanceof ASTNode)
      return node
    
    const newChildren = []
    
    node.children.forEach(c => {
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

    node.children = newChildren

    return node
  }
}

/**
 * equivalent of musical cancer transformation,
 * modifies input AST
 * @param {ASTNode} node node with only leafs as children
 * @returns {ASTNode}
 */
function reverseSubTreesVert(node) {
  if (node instanceof ASTNode)
    node.children.reverse()

  return node
}

/**
 * modifies input
 * @param {ASTNode} ast 
 * @returns {ASTNode}
 */
function reverseVertRec(ast) {
  dft(ast, reverseSubTreesVert)

  return ast
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
 * @param {[Interval]} intervals
 * @returns {[Tone]}
 */
function tonesFromIntervals(intervals) {
  if (intervals.isEmpty())
    return []
  
  if (intervals.length === 1)
    return [intervals[0].from, intervals[0].to]

  const tones = [intervals[0].from, intervals[0].to]
  const remainingIntervals = intervals.slice(1)

  remainingIntervals.forEach(interval => {
    if (!isSameTone(tones.at(-1), interval.from))
      tones.push(interval.from)
    
    tones.push(interval.to)
  })

  return tones

  /**
   * @param {Tone} left 
   * @param {Tone} right 
   * @returns {boolean}
   */
  function isSameTone(left, right) {
    return left.noteNumber === right.noteNumber
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

/**
 * @param {SyntaxTree} ast 
 * @returns {[Tone]}
 */
function flattenIntervals(ast) {
  const intervals = flatten(ast)
  return tonesFromIntervals(intervals)
}

//#endregion

// tree :: AbstractSyntaxTree => AbstractSyntaxTree
// serialize :: AbstractSyntaxTree => [Lexem]
export default {
  default: {
    tree: id,
    serialize: flatten
  },

  'default-intervals': {
    tree: id,
    serialize: flattenIntervals
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
    tree: mkDropSubTrees(),
    serialize: flatten
  },

  'double-root-sub': {
    tree: mkDoubleSubTrees(),
    serialize: flatten
  },

  'double-root-tones': {
    tree: mkDoubleSubTrees(),
    serialize: flatten
  },

  'reverse-root-sub': {
    tree: reverseSubTreesVert,
    serialize: flatten
  },

  'reverse-rec': {
    tree: reverseVertRec,
    serialize: flatten
  },

  'rhythm-straight2swing': {
    tree: straight2swing,
    serialize: flatten
  }

}
