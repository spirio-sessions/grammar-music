import { Interval, Lexem, MusicEvent, Tone } from '../util/midi-handling.js'
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
 * modifies input
 * @param {ASTNode} node 
 */
function cancer(node) {
  if (!isTerminalIntervalNode(node))
    return

  reverseSubTreesVert(node)

  node.children.forEach(child => {
    const interval = child.value
    
    const swap = interval.from
    interval.from = interval.to
    interval.to = swap
    
    interval.halfToneSteps *= -1
  })
}

/**
 * modifies input
 * @param {ASTNode} node 
 */
function mirror(node) {
  if (!isTerminalIntervalNode(node))
    return
  
  let tone = node.children[0].value.from

  node.children.forEach(child => {
    const interval = child.value

    interval.from = tone
    const shift = -1 * interval.halfToneSteps
    interval.to.noteNumber = interval.from.noteNumber + shift
    
    tone = interval.to
  })
}

/**
 * modifies input
 * @param {ASTNode} node 
 */
function mirrorCancer(node) {
  cancer(node)
  mirror(node)
}

/**
 * modifies input
 * @param {ASTNode} node 
 */
function cancerDouble(node) {
  if (!isTerminalIntervalNode(node))
    return node

  const left = copyTree(node)
  left.label = 'CCRDBL'
  const right = copyTree(node)
  right.label = 'CCRDBR'
  cancer(right)

  node.label = 'CCRDB'
  node.children = [left, right]
}

/**
 * modifies input
 * @param {ASTNode} node 
 */
function mirrorDouble(node) {
  if (!isTerminalIntervalNode(node))
    return
  
  const left = copyTree(node)
  left.label = 'MRRDBL'
  const right = copyTree(node)
  right.label = 'MRRDBR'
  mirror(right)

  node.label = 'MRRDB'
  node.children = [left, right]
}

/**
 * modifies input
 * @param {ASTNode} node 
 */
function mirrorCancerDouble (node) {
  if (!isTerminalIntervalNode(node))
    return
  
  const left = copyTree(node)
  left.label = 'MCDBL'
  const right = copyTree(node)
  right.label = 'MCDBR'
  mirrorCancer(right)

  node.label = 'MCDB'
  node.children = [left, right]
}

/**
 * @param {ASTNode} node 
 * @returns {boolean}
 */
function isTerminalIntervalNode(node) {
  return node.children.every(c => c instanceof ASTLeaf && c.value instanceof Interval)
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
        if (ast.label === matchLabel || ast.label === '*') {
          const transform = config[matchLabel]
          transform(ast)
          return
        }
      }
    })

    return ast
  }
}

//#endregion

//#region serialization

/**
 * @param {[Interval]} intervals
 * @returns {[Tone]}
 */
function tonesFromIntervals(intervals) {
  if (intervals.isEmpty())
    return []

  const tones = serializeInterval(intervals[0])
  const remainingIntervals = intervals.slice(1)

  remainingIntervals.forEach(interval => {
    const serialized = serializeInterval(interval)

    if (isSameTone(tones.at(-1), interval.from))
      tones.push(...serialized.slice(1)) // skip from, as already contained
    else
      tones.push(...serialized)
  })

  return tones

  /**
   * @param {Interval} interval 
   * @returns {[MusicEvent]}
   */
  function serializeInterval(interval) {
    return interval.rest
      ? [interval.from, interval.rest, interval.to]
      : [interval.from, interval.to]
  }

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
    const flat = []
    dft(ast, ast => {
      if (ast instanceof ASTLeaf)
        flat.push(ast.value)
    })

    if (flat.every(lexem => lexem instanceof Interval))
      return tonesFromIntervals(flat)
    else
      return flat
}

//#endregion

// tree :: AbstractSyntaxTree => AbstractSyntaxTree
// serialize :: AbstractSyntaxTree => [Lexem]
export default {
  default: {
    tree: id,
    serialize: flatten
  },

  // 'shuffle-root': {
  //   tree: shuffleRoot,
  //   serialize: flatten
  // },

  // 'drop-root-sub': {
  //   tree: mkDropSubTrees(),
  //   serialize: flatten
  // },

  // 'double-root-sub': {
  //   tree: mkDoubleSubTrees(),
  //   serialize: flatten
  // },

  // 'reverse-root-sub': {
  //   tree: reverseSubTreesVert,
  //   serialize: flatten
  // },

  // 'reverse-rec': {
  //   tree: reverseVertRec,
  //   serialize: flatten
  // },

  // 'rhythm-straight2swing': {
  //   tree: straight2swing,
  //   serialize: flatten
  // },

  'scale-mirror': {
    tree: matchTransform({
      SCALEU: mirror,
      SCALED: mirror
    }),
    serialize: flatten
  },

  'scale-mirror-double': {
    tree: matchTransform({
      SCALEU: mirrorDouble,
      SCALED: mirrorDouble
    }),
    serialize: flatten
  },

  'scale-cancer': {
    tree: matchTransform({
      SCALEU: cancer,
      SCALED: cancer
    }),
    serialize: flatten
  },

  'scale-cancer-double': {
    tree: matchTransform({
      SCALEU: cancerDouble,
      SCALED: cancerDouble
    }),
    serialize: flatten
  },

  'scale-mirror-cancer': {
    tree: matchTransform({
      SCALEU: mirrorCancer,
      SCALED: mirrorCancer
    }),
    serialize: flatten
  },

  'scale-mirror-cancer-double': {
    tree: matchTransform({
      SCALEU: mirrorCancerDouble,
      SCALED: mirrorCancerDouble
    }),
    serialize: flatten
  }

}
