import { Tone } from './tokenize.js'

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
ctx.translate(0, canvas.height)
ctx.scale(1, -1)

let x = 0
let y, w
const h = canvas.height / 128 // 128 midi tones

/**
 * 
 * @param {Token} token 
 */
export function renderToken(token) {
  w = token.duration / 20

  if (x + w > canvas.width) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    x = 0
  }
    
  if (token instanceof Tone) {
    y = h * token.noteNumber
    const relativeVelocity = token.velocity / 100
    ctx.fillStyle = `rgb(${relativeVelocity * 255}, 0, ${(1-relativeVelocity) * 255})`
    ctx.fillRect(x, y, w, h)
  }
  // do not render rests

    x += w
}
