let readIndex = 0

export function transformTransfer(parseDump) {
  const tones = parseDump.slice(readIndex)
  readIndex = parseDump.length
  console.log(tones)
}