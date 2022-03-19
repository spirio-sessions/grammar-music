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

class Lexem{
  constructor(type, start, duration) {
    this.start = start // timestamp
    this.type = type
    this.duration = duration // ms
  }
}

export class Rest extends Lexem {
  constructor(start, duration) {
    super('rest', start, duration)
  }

  serialize() {
    return `(R ${this.start} ${this.duration})`
  }

  toString() {
    return 'rest'
  }
}

export class Tone extends Lexem {
  constructor(start, duration, noteNumber, velocity) {
    super('tone', start, duration)
    
    // this may fail!
    const pitch = midiToPitch(noteNumber)
    
    this.noteNumber = noteNumber
    this.pitch = pitch
    this.velocity = velocity
  }

  serialize() {
    return `(T ${this.start} ${this.duration} ${this.noteNumber} ${this.pitch} ${this.velocity})`
  }

  toString() {
    return `${this.pitch}`
  }
}

/**
 * @param {Number} tStart
 * @param {(result:Tone|Rest|undefined)=>void} callback 
 * @returns {(message:MIDIMessageEvent)=>void}
 */
export const mkMidiHandler = (tStart, callback) => {
  let tLast = 0
  let nLast, vLast, mLast 

  return message => {
    const now = performance.now()
    const timestamp = now - tStart
    const duration = timestamp - tLast
    const data = message.data

    const statusCode = data[0] >> 4
    const noteNumber = data[1]
    const velocity = data[2]
    
    switch (statusCode) {
      case 8:
        callback(handleNoteOff())
        break
      
      case 9:
        callback(handleNoteOn())
        break
    
      default:
        console.log('unknown midi message')
        break
    }

    function handleNoteOff() {
      if (nLast === noteNumber) {
        console.log(noteNumber + ' off')

        const tone = new Tone(tLast, duration, noteNumber, vLast)
        mLast = 'off'
        tLast = timestamp

        return tone
      }
    }

    function handleNoteOn() {

      if (velocity === 0)
        return handleNoteOff()

      console.log(noteNumber + ' on')

      let result

      if (mLast === 'on') // polyphonic
        result = new Tone(tLast, duration, nLast, vLast)

      else if (mLast === 'off'/* && duration > 50*/) // monophonic + rest
        result = new Rest(tLast, duration)
      
      tLast = timestamp
      nLast = noteNumber
      vLast = velocity
      mLast = 'on'

      return result
    }
  }
}

import { sleep } from './util.js'

export async function transfer(lexems, midiOut) {

  for (const lexem of lexems) {
    const now = Math.round(performance.now())

    // handle rest
    if (lexem instanceof Rest) {
      console.log(lexem.serialize())
      await sleep(lexem.duration)
    }
    // handle tone
    else if (lexem instanceof Tone) {
      const noteOn = [0x90, lexem.noteNumber, lexem.velocity]
      const noteOff = [0x80, lexem.noteNumber, 0]
  
      console.log(lexem.serialize())

      midiOut.send(noteOn)
      await sleep(lexem.duration)
      midiOut.send(noteOff)
    }
    else {
      console.log(`${now} unkown lexem`)
    }
  }
}
