import { Tone } from './midi-handling.js'

const canvasIn = document.getElementById('render-in')
const ctxIn = canvasIn.getContext('2d')
ctxIn.translate(0, canvasIn.height)
ctxIn.scale(1, -1)

const canvasOut = document.getElementById('render-out')
const ctxOut = canvasOut.getContext('2d')
ctxOut.translate(0, canvasOut.height)
ctxOut.scale(1, -1)

const h = canvasIn.height / 128 // 128 midi tones, applies to both canvases
let x = 0

/**
 * Place a tone or rest onto the canvas in a piano-roll-like fashion.
 * @param {Lexem} lexem 
 */
function renderLexem(lexem, widthMs, ctx) {
  //w = token.duration / 20
  const w = widthMs * lexem.duration // fit all lexems from section on canvas
    
  if (lexem instanceof Tone) {
    const y = h * lexem.noteNumber
    ctx.fillStyle = `rgb(${(lexem.dominant ? 1 : 0) * 255}, 0, ${(lexem.dominant ? 0 : 1) * 255})`
    ctx.fillRect(x, y, w, h)
  }
  // do not render rests

  x += w
}

/**
 * Renders a sequence of tones and rests in a piano-roll-like fashion onto the canvas.
 * @param {Array<Lexem>} lexems
 * @param {'in'|'out'} direction
 */
export function renderLexems(lexems, direction) {
  const totalDuration = lexems
    .reduce((acc, t) => acc += t.duration, 0)
  const widthMs = canvasIn.width / totalDuration
  const ctx = direction === 'in'
    ? ctxIn 
    : ctxOut

  ctx.clearRect(0, 0, canvasIn.width, canvasIn.height)
  
  lexems.forEach(t => renderLexem(t, widthMs, ctx))
  // important! reset x for next rendering
  x = 0
}

import { SyntaxTree, printST } from '../parsing/parser.mjs'

let viz = new Viz()
let display = document.getElementById('tree-display')

/**
 * Renders a syntax tree.
 * @param {SyntaxTree} st 
 */
export async function renderTree(st) {
  const dot = printST(st, 'dot')
  try {
    const svg = await viz.renderSVGElement(dot)
    svg.id = 'tree-display'
    svg.classList.add('stroked')
    display.parentNode.replaceChild(svg, display)
    display = svg
  } catch(e) {
    viz = new Viz()
    console.error(e)
  }
}
