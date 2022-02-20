import { Tone } from "./tokenize.js"

/**
 * May fail if less than 2 tones in tokens and return NaN.
 * All durations in ms.
 * @param {Array<Token>} tokens 
 * @returns {Number} bpm or NaN
 */
function estimateBpm(tokens) {

  const tones = tokens.filter(t => t instanceof Tone)

  if (tones.length < 2)
    return NaN;

  let lastStart = tones[0].start
  let currentStart
  const onsetPeriods = []

  for (let i = 1; i < tones.length; i++) {
    currentStart = tones[i].start
    onsetPeriods.push(currentStart - lastStart)

    lastStart = currentStart
  }

  const minOnsetPeriod = Math.min(...onsetPeriods)
  const remainders = onsetPeriods.map(op => op % minOnsetPeriod)
  let maxRemainder = Math.max(...remainders)

  if (maxRemainder < 50)
    maxRemainder = minOnsetPeriod

  const onsetPeriodMin = maxRemainder / (1000 * 60)

  return 1 / onsetPeriodMin
}

/**
 * 
 * @param {Number} noteDuration in ms
 * @param {Number} bpm
 */
function estimateNoteValue(noteDurationMs, bpm) {
  const beatPeriodMs = (1 / bpm) * 60 * 1000
  const max = Math.max(beatPeriodMs, noteDurationMs)
  const min = Math.min(beatPeriodMs, noteDurationMs)

  let noteValue = Math.round(max / min)

  if (beatPeriodMs > noteDurationMs)
    return 1 / noteValue
  else
    return noteValue
}

/**
 * Annotate each token's length relativ to the underlying beat.
 * @param {Array<Token>} tokens 
 * @param {Number} bpm 
 */
function annotateNoteValues(tokens, bpm) {
  return tokens.map(token => {
    token.noteValue = estimateNoteValue(token.duration, bpm)
    return token
  })
}

/**
 * Mark dominant tones in a sequence of tokens.
 * @param {Array<Token>} tokens 
 * return {Array<Token>} annotated tokens
 */
function annotateDominants(tokens) {
  const tones = tokens.filter(t => t instanceof Tone)

  if (tones.length < 3)
    return tokens

  if (tones[0].velocity > tones[1].velocity)
    tones[0].dominant = true
  else
    tones[0].dominant = false

  for (let i = 1; i < tones.length - 1; i++) {
    if (tones[i-1].velocity < tones[i].velocity && tones[i].velocity > tones[i+1].velocity)
      tones[i].dominant = true
    else
      tones[i].dominant = false
  }

  if (tones.at(-2).velocity < tones.at(-1).velocity)
    tones.at(-1).dominant = true
  else
    tones[0].dominant = false

  // return original sequence
  return tokens
}

export function analyse(tokens) {
  const bpm = estimateBpm(tokens)

  return {
    bpm: bpm,
    annotated: annotateDominants(annotateNoteValues(tokens, bpm))
  } 
}
