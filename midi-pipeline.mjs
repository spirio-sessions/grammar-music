export function initMidiPipeline(midiInput, melodyDump) {
  midiInput.onmidimessage = console.log
}