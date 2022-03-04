import { Tone } from './tokenize.js'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
ctx.translate(0, canvas.height)
ctx.scale(1, -1)

let x = 0
let y , w
const h = canvas.height / 128 // 128 midi tones

/**
 * Place a tone or rest onto the canvas in a piano-roll-like fashion.
 * @param {Token} token 
 */
function renderToken(token, widthMs) {
  //w = token.duration / 20
  w = widthMs * token.duration // fit all tokens from section on canvas

  if (x + w > canvas.width) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    x = 0
  }
    
  if (token instanceof Tone) {
    y = h * token.noteNumber
    // const relativeVelocity = token.velocity / 128 // midi velocity range: 0 - 127
    // ctx.fillStyle = `rgb(${relativeVelocity * 255}, 128, ${(1-relativeVelocity) * 255})`
    ctx.fillStyle = `rgb(${(token.dominant ? 1 : 0) * 255}, 0, ${(token.dominant ? 0 : 1) * 255})`
    ctx.fillRect(x, y, w, h)
  }
  // do not render rests

  x += w
}

/**
 * Renders a sequence of tones and rests in a piano-roll-like fashion onto the canvas.
 * @param {Array<Token>} tokens 
 */
export function renderTokens(tokens) {
  console.log(tokens)
  const totalDuration = tokens.reduce((acc, t) => acc += t.duration, 0)
  const widthMs = canvas.width / totalDuration
  tokens.forEach(t => renderToken(t, widthMs))
}

import { SyntaxTree, printST } from './parsing/parser.mjs'

let viz = new Viz()
let display = document.getElementById('tree-display')

/**
 * Renders a syntax tree.
 * @param {SyntaxTree} st 
 */
export function renderTree(st) {
  const dot = printST(st, 'dot')
  viz.renderSVGElement(dot)
    .then(svg => {
      svg.classList.add('stroked')
      svg.style.width = '600px'
      svg.style.height = '400px'
      display.parentNode.replaceChild(svg, display)
      display = svg
    })
    .catch(e => {
      viz = new Viz()
      console.error(e)
    })
}
