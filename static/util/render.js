import { Lexem, MusicEvent, Tone } from './midi-handling.js'
import { Token } from '../parsing/lexer.mjs'

const canvasIn = document.getElementById('render-in')
const ctxIn = canvasIn.getContext('2d')
ctxIn.translate(0, canvasIn.height)
ctxIn.scale(1, -1)

const canvasOut = document.getElementById('render-out')
const ctxOut = canvasOut.getContext('2d')
ctxOut.translate(0, canvasOut.height)
ctxOut.scale(1, -1)

let x = 0

/**
 * Place a tone or rest onto the canvas in a piano-roll-like fashion.
 * @param {Lexem} lexem
 * @param {Number} widthMs
 * @param {Number} h
 * @param {Number} minNoteNumber
 * @param {CanvasRenderingContext2D} ctx
 * @param {(t:Token)=>string} colorizeToken
 */
function renderLexem(lexem, widthMs, h, minNoteNumber, ctx, colorizeToken = _ => 'black') {
  const w = widthMs * lexem.duration
    
  if (lexem instanceof Tone) {
    const y = h * (lexem.noteNumber - minNoteNumber)
    ctx.fillStyle = colorizeToken(lexem)
    ctx.fillRect(x, y, w, h)
  }
  // do not render rests

  x += w
}

/**
 * Renders a sequence of tones and rests in a piano-roll-like fashion onto the canvas.
 * @param {Array<Token>} lexems
 * @param {'in'|'out'} direction
 * @param {(t:Token)=>string} colorizeToken
 */
export function renderLexems(lexems, direction, colorizeToken) {
  const musicEvents = lexems.filter(l => l instanceof MusicEvent)
  
  const totalDuration = musicEvents
    .reduce((acc, t) => acc += t.duration, 0)
  const widthMs = canvasIn.width / totalDuration

  const tones = lexems.filter(l => l instanceof Tone)
  const minNoteNumber = tones.reduce((minTone, lexem) =>
    lexem.noteNumber < minTone.noteNumber ? lexem : minTone
    , {noteNumber: 127}).noteNumber
  const maxNoteNumber = tones.reduce((maxTone, lexem) =>
    lexem.noteNumber > maxTone.noteNumber ? lexem : maxTone
    , {noteNumber: 0}).noteNumber
  const ambitus = maxNoteNumber - minNoteNumber
  const h = canvasIn.height / (ambitus + 1)

  const ctx = direction === 'in'
    ? ctxIn 
    : ctxOut

  ctx.clearRect(0, 0, canvasIn.width, canvasIn.height)
  
  musicEvents.forEach(t => renderLexem(t, widthMs, h, minNoteNumber, ctx, colorizeToken))
  // important! reset x for next rendering
  x = 0
}

import { SyntaxTree, STLeaf, bft, ASTLeaf, AbstractSyntaxTree, isNode, isLeaf } from '../parsing/tree.mjs'

// leaf is only container, print token
const defaultPrintLeaf = l => l.label

/**
 * Prints a default graphviz dot representation for a syntax tree.
 * Uses phenotypic checking to recognize nodes and leafs -> works with JSON.
 * @param {SyntaxTree|AbstractSyntaxTree} tree 
 * @param {(l:STLeaf|ASTLeaf)=>String} printLeaf
 * @returns {String}
 */
function printTreeDot(tree, printLeaf = defaultPrintLeaf) {
  const start = 'graph G {\n  size="6.25,4.16";'
  let i = 0
  let defs = '', leafs = []
  const end = '\n}'

  bft(tree, tree => tree.i = i++)

  bft(tree, tree => {
    if (isNode(tree)) {
      defs += `\n  { n${tree.i} [label=${tree.label}] }`
      for (const c of tree.children)
        defs += `\n  n${tree.i} -- n${c.i} ;`
    }
    else if (isLeaf(tree))
      leafs.push(tree)
  })

  const leafAttrs = leafs.map(l => `  { n${l.i} [label="${printLeaf(l)}" shape=none] }`)
  const leafNodes = leafs.map(l => `n${l.i}`)
  const leafRank = `  { rank=same ; ${leafNodes.join(' ; ')} }`

  return [ start, defs, '', ...leafAttrs, '', leafRank, end ].join('\n')
}

let viz = new Viz()

/**
 * Renders a syntax tree.
 * @param {String} displayId
 * @param {SyntaxTree} st
 * @param {(l:STLeaf)=>String} printLeaf
 */
export async function renderTree(displayId, st, printLeaf) {
  const display = document.getElementById(displayId)
  const dot = printTreeDot(st, printLeaf)
  try {
    const svg = await viz.renderSVGElement(dot)
    svg.id = displayId
    svg.classList.add('stroked', 'tree-display')
    display.parentNode.replaceChild(svg, display)
  } catch(e) {
    viz = new Viz()
    console.error(e)
  }
}
