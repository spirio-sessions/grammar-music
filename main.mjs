import { setupIO } from './io-setup.mjs'
import { setupPipeline } from './pipeline-setup.mjs'

const inputForm = document.getElementById('input-form')
const outputForm = document.getElementById('output-form')
await setupIO(inputForm, outputForm, setupPipeline)



// sourceNode -> (analyserNode, emphDump)

// tone branch
// - analyser node

// emph branch
// - low-pass-filter
// - audio-worklet with global emph dump array

// #endregion



// #region melody-parsing

// (analyserNode, toggleButton) -> melodyDump

// setup analyser sampling (request animation frame)

// setup melody-parsing with global dump array
// connect analyser-sampling to toggle button

// #endregion



// #region melody-transformation-transmission

// merge     :: ([Tone], [emphTimestamp]) -> [EmphTone]
// transform :: [EmphTone] -> [EmphTone]
// transmit  :: [EmphTone] -> MidiRequest
// execute   :: merge > transform > transmit

// setup merge
// import transform
// configure transmit destination

// trigger execute with request animation frame every few seconds
// connect triggering to toggle button

// #endregion