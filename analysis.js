import { Tone } from "./tokenize.js"

/**
 * May fail if less than 2 tones in tokens and return NaN.
 * @param {Array<Token>} tokens 
 * @returns {Number} bpm or NaN
 */
function estimateBpm(tokens) {

  const tones = tokens.filter(t => t instanceof Tone)

  if (tones.length < 2)
    return NaN;

  let lastStart = tones[0].start
  let currentStart
  let onsetPeriodAcc = 0

  for (let i = 1; i < tones.length; i++) {
    currentStart = tones[i].start

    onsetPeriodAcc += currentStart - lastStart
    lastStart = currentStart
  }

  const onsetPeriodMs = onsetPeriodAcc / tones.length
  const onsetPeriodMin = onsetPeriodMs / (1000 * 60)

  return 1 / onsetPeriodMin
}

/**
 * Mark dominant tones in a sequence of tokens.
 * @param {Array<Token>} tokens 
 * return {Array<Token>} annotated tokens
 */
function anotateDominants(tokens) {
  const tones = tokens.filter(t => t instanceof Tone)

  if (tones.length < 3)
    return tokens

  if (tones[0].velocity > tones[1].velocity)
    tones[0].dominant = true

  for (let i = 1; i < tones.length - 1; i++) {
    if (tones[i-1].velocity < tones[i].velocity && tones[i].velocity > tones[i+1].velocity)
      tones[i].dominant = true
    else
      tones[i].dominant = false
  }

  if (tones.at(-2).velocity < tones.at(-1).velocity)
    tones.at(-1).dominant = true

  // return original sequence
  return tokens
}

export function analyse(tokens) {
  estimateBpm(tokens)
}
