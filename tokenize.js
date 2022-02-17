export const lookupTokenize = {
  midi: { startTokenizing: startMidi, stopTokenizing: stopMidi }
}

function startMidi(source, dump, tokenizationState) {
  
  const tStart = performance.now()
  let tLast, nLast, vLast, mLast
  
  source.onmidimessage = message => {
    const now = performance.now()

    const timestamp = now - tStart
    const duration = timestamp - tLast
    const data = message.data

    const statusCode = data[0] >> 4
    const noteNumber = data[1]
    const velocity = data[2]
    
    switch (statusCode) {
      case 8: // note off
        if (nLast === noteNumber) {

          const tone = new Tone(tLast, duration, noteNumber, vLast)
          dump.push(tone)
          tokenizationState(now, false)

          mLast = 'off'
          tLast = timestamp
        }
        break
      
      case 9: // note on
        if (mLast === 'on') { // polyphonic
          const tone = new Tone(tLast, duration, nLast, vLast)
          dump.push(tone)
        }

        if (mLast === 'off' && duration > 50) { // monophonic + rest
          const rest = new Rest(tLast, duration)
          dump.push(rest)
        }

        tokenizationState(now, true)

        tLast = timestamp
        nLast = noteNumber
        vLast = velocity
        mLast = 'on'
        break
    
      default:
        console.log('unknown message')
        return
    }
  }
}

function midiToPitch(noteNumber) {
  const octaveOffset = Math.floor(noteNumber / 12) - 1
  const a4Offset = noteNumber - 69

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
      throw new Error(`midi note number ${noteNumber} cannot be converted into a pitch`)
  }

  return pitch
}

function stopMidi(source) {
  source.onmidimessage = undefined
}

class Token{
  constructor(type, start, duration) {
    this.start = start // timestamp
    this.type = type
    this.duration = duration // ms
  }
}

export class Rest extends Token {
  constructor(start, duration) {
    super('rest', start, duration)
  }
}

export class Tone extends Token {
  constructor(start, duration, noteNumber, velocity) {
    super('tone', start, duration)
    
    // this may fail!
    const pitch = midiToPitch(noteNumber)
    
    this.noteNumber = noteNumber
    this.pitch = pitch
    this.velocity = velocity
  }
}