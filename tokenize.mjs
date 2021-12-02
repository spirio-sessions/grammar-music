export const lookupTokenize = {
  midi: { startTokenizing: startMidi, stopTokenizing: stopMidi }
}

function startMidi(source, dump) {
  
  const tStart = performance.now()
  let tLast, nLast, vLast
  
  source.onmidimessage = message => {
    const timestamp = performance.now() - tStart
    const duration = timestamp - tLast
    const data = message.data //Array.from(message.data)

    const statusCode = data[0] >> 4
    const noteNumber = data[1]
    const velocity = data[2]
    
    switch (statusCode) {
      case 8: // note off
        if (nLast === noteNumber) {
          tLast = timestamp
          
          const tone = midiToPitch(noteNumber)
          tone.duration = duration 
          tone.velocity = vLast

          dump.push(tone)
        }
        break
      
      case 9: // note on
        tLast = timestamp
        nLast = noteNumber
        vLast = velocity
        break
    
      default:
        console.log('unknown message')
        return
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
        pitch = null
        break
    }

    return { noteNumber, pitch }
  }
}

function stopMidi(source) {
  source.onmidimessage = undefined
}