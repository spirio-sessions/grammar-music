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

export const hanning = buffer => 
  buffer.map((sample, i) => sample * Math.sin(Math.PI * i / buffer.length) ** 2)

export const zeroPad = (buffer, length) => {
  const array = Array.from(buffer)
  array.unshift(...new Array(length).fill(0))
  array.push(...new Array(length).fill(0))
  return array
}

export const applyWindow = (reach, hop = 1, window = hanning) => buffer => {
  const zeroPadded = zeroPad(buffer, reach)

  let frame, newValue
  const windowed = []

  for (let i = reach; i < zeroPadded.length - reach; i += hop){
      frame = zeroPadded.slice(i - reach, i + reach) 
      newValue = avg(window(frame))
      windowed.push(newValue)
  }

  return windowed
}