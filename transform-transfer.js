let readIndex = 0

export async function transformTransfer(tokenDump, destination) {
  const call = tokenDump.slice(readIndex)
  readIndex = tokenDump.length

  const response = transform(call)

  await transfer(response, destination)
}

import { analyse } from './analysis.js'

function transform(tokens) {

  analyse(tokens)

  // tokens.reverse() // for demo only
  return tokens
}

import { sleep } from './util.js'
import { Rest, Tone } from './tokenize.js'

async function transfer(tokens, destination) {
  // send tones to midi input device 'destination'

  for (const token of tokens) {
    const now = Math.round(performance.now())

    // handle rest
    if (token instanceof Rest) {
      console.log(`${now} R   ${Math.round(token.duration)}`)
      await sleep(token.duration)
    }
    // handle tone
    else if (token instanceof Tone) {
      const noteOn = [0x90, token.noteNumber, token.velocity]
      const noteOff = [0x80, token.noteNumber, 0]
  
      console.log(`${now} ${token.pitch} ${Math.round(token.duration)} ${token.velocity}`)

      destination.send(noteOn)
      await sleep(token.duration)
      destination.send(noteOff)
    }
    else {
      console.log(`${now} unkown token`)
    }
  }
}
