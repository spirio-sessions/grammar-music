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

export function analyse(tokens) {
  estimateBpm(tokens)
}
