let readIndex = 0

export async function transformTransfer(parseDump, destination) {
  const call = parseDump.slice(readIndex)
  readIndex = parseDump.length

  const response = transform(call)

  await transfer(response, destination)
}

function transform(tokens) {
  // parse, manipulate and serialize
  // tokens.reverse() // for demo only
  return tokens
}

import { sleep } from './util.mjs'

async function transfer(tokens, destination) {
  // send tones to midi input device 'destination'

  for (const token of tokens) {
    // handle rest
    if (token.type === 'rest') {
      console.log(`${Math.round(performance.now())} R   ${Math.round(token.duration)}`)
      await sleep(token.duration)
    }
    // handle tone
    else {
      const noteOn = [0x90, token.noteNumber, token.velocity]
      const noteOff = [0x80, token.noteNumber, 0]
  
      console.log(`${Math.round(performance.now())} ${token.pitch} ${Math.round(token.duration)}`)

      destination.send(noteOn)
      await sleep(token.duration)
      destination.send(noteOff)
    }
  }
}