let readIndex = 0

export async function transformTransfer(parseDump, destination) {
  const call = parseDump.slice(readIndex)
  readIndex = parseDump.length

  const response = transform(call)

  await transfer(response, destination)
}

function transform(tones) {
  // parse, manipulate and serialize
  // tones.reverse() // for demo only
  return tones
}

import { sleep } from './util.mjs'

async function transfer(tones, destination) {
  // send tones to midi input device 'destination'

  for (const tone of tones) {
    const noteOn = [0x90, tone.noteNumber, tone.velocity]
    const noteOff = [0x80, tone.noteNumber, 0]

    console.log(`${tone.pitch}  ON: ${performance.now()}`)
    destination.send(noteOn)

    await sleep(tone.duration)
    console.log(`${tone.pitch} OFF: ${performance.now()}`)
    destination.send(noteOff)
  }
}