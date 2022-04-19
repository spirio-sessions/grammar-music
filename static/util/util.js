Number.prototype.mod = function(n) {
  return ((this % n) + n) % n
}

Array.prototype.isEmpty = function () {
  return this.length === 0
}

/**
 * @param {String} message 
 */
export function error(message) {
  throw new Error(message)
}

/**
 * @param {Number} ms 
 */
export async function sleep(ms) {
  await new Promise(r => setTimeout(r, ms))
}

export const argTop = k => array => {
  let tops = []
  for (let i = 0; i < array.length; i++) {
    tops.push({val: array[i], pos: i})
    tops.sort((a, b) => b.val - a.val)
    tops.length = k
  }
  return tops.map(t => t.pos)
}

export const avg = array => array.reduce((a, b) => a + b, 0) / array.length

export const median = values => {
  if(values.length === 0)
    return NaN 

  values.sort((a, b) => a - b)

  const half = Math.floor(values.length / 2)
  
  if (values.length % 2)
    return values[half]
  else
    return (values[half - 1] + values[half]) / 2.0
}

export const fToTone = (fA4 = 440) => f => {
  if (f <= 0)
    return { pitch: null, midi: null }

  const a4Offset = Math.round(12 * Math.log2(f / fA4))
  const midiNumber = 69 + a4Offset
  const octaveOffset = Math.floor(midiNumber / 12) - 1
  
  let relativePitchIndex = a4Offset % 12
  if (relativePitchIndex < 0)
    relativePitchIndex += 12
  let pitch

  switch (relativePitchIndex) {
    case 0:
      pitch = `A_${octaveOffset}`
      break
    case 1:
      pitch = `A#${octaveOffset}`
      break
    case 2:
      pitch = `B_${octaveOffset}`
      break
    case 3:
      pitch = `C_${octaveOffset}`
      break
    case 4:
      pitch = `C#${octaveOffset}`
      break
    case 5:
      pitch = `D_${octaveOffset}`
      break
    case 6:
      pitch = `D#${octaveOffset}`
      break
    case 7:
      pitch = `E_${octaveOffset}`
      break
    case 8:
      pitch = `F_${octaveOffset}`
      break
    case 9:
      pitch = `F#${octaveOffset}`
      break
    case 10:
      pitch = `G_${octaveOffset}`
      break
    case 11:
      pitch = `G#${octaveOffset}`
      break
    default:
      pitch = null
      break
  }

  return { pitch, midiNumber }
}

export const aggregateTokens = tokens => {
  return tokens.reduce((acc, t) => {
    const lastIndex = acc.length - 1
    if (lastIndex > -1 && acc[lastIndex].midiNumber === t.midiNumber)
      acc[lastIndex].duration += t.duration
    else
      acc.push(t)
    return acc
  }, [])
}
