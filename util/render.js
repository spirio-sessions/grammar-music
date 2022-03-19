import { Tone } from './midi-handling.js'
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
 * @param {Token} token
 * @param {Number} widthMs
 * @param {Number} h
 * @param {Number} minNoteNumber
 * @param {CanvasRenderingContext2D} ctx
 * @param {(t:Token)=>string} colorizeToken
 */
function renderToken(token, widthMs, h, minNoteNumber, ctx, colorizeToken = _ => 'black') {
  const lexem = token.lexem
  const w = widthMs * lexem.duration
    
  if (lexem instanceof Tone) {
    const y = h * (lexem.noteNumber - minNoteNumber)
    ctx.fillStyle = colorizeToken(token)
    ctx.fillRect(x, y, w, h)
  }
  // do not render rests

  x += w
}

/**
 * Renders a sequence of tones and rests in a piano-roll-like fashion onto the canvas.
 * @param {Array<Token>} tokens
 * @param {'in'|'out'} direction
 * @param {(t:Token)=>string} colorizeToken
 */
export function renderTokens(tokens, direction, colorizeToken) {
  const totalDuration = tokens
    .reduce((acc, t) => acc += t.lexem.duration, 0)
  const widthMs = canvasIn.width / totalDuration

  const minNoteNumber = tokens.reduce((minTone, token) =>
    token.lexem.noteNumber < minTone.noteNumber ? token.lexem : minTone
    , {noteNumber: 127}).noteNumber
  const maxNoteNumber = tokens.reduce((maxTone, token) =>
    token.lexem.noteNumber > maxTone.noteNumber ? token.lexem : maxTone
    , {noteNumber: 0}).noteNumber
  const ambitus = maxNoteNumber - minNoteNumber
  const h = canvasIn.height / (ambitus + 1)

  const ctx = direction === 'in'
    ? ctxIn 
    : ctxOut

  ctx.clearRect(0, 0, canvasIn.width, canvasIn.height)
  
  tokens.forEach(t => renderToken(t, widthMs, h, minNoteNumber, ctx, colorizeToken))
  // important! reset x for next rendering
  x = 0
}

import { SyntaxTree, STLeaf, STNode, bft } from '../parsing/parser.mjs'

// leaf is only container, print token
const defaultPrintLeaf = l => l.token.print()

/**
 * Prints a deafault graphviz dot representation for a syntax tree.
 * @param {SyntaxTree} st 
 * @param {(l:STLeaf)=>String} printLeaf
 * @returns {String}
 */
function printSTDot(st, printLeaf = defaultPrintLeaf) {
  const start = 'graph G {\n  size="6.25,4.16";'
  let i = 0
  let defs = '', leafs = []
  const end = '\n}'

  bft(st, st => st.i = i++)

  bft(st, st => {
    if (st instanceof STNode) {
      defs += `\n  { n${st.i} [label=${st.label}] }`
      for (const c of st.children)
        defs += `\n  n${st.i} -- n${c.i} ;`
    }
    else if (st instanceof STLeaf)
      leafs.push(st)
  })

  const leafAttrs = leafs.map(l => `  { n${l.i} [label="${printLeaf(l)}" shape=none] }`)
  const leafNodes = leafs.map(l => `n${l.i}`)
  const leafRank = `  { rank=same ; ${leafNodes.join(' ; ')} }`

  return [ start, defs, '', ...leafAttrs, '', leafRank, end ].join('\n')
}

let viz = new Viz()
let display = document.getElementById('tree-display')

/**
 * Renders a syntax tree.
 * @param {SyntaxTree} st 
 */
export async function renderTree(st, printLeaf) {
  const dot = printSTDot(st, printLeaf)
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
