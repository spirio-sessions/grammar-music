//#region input generation

async function sleep(ms) {
  await new Promise(r => setTimeout(r, ms))
}

async function* generateInput(queryValue, ms){
  while(true){
    const { available, value } = queryValue()
    if(available)
      return value
    else{
      await sleep(ms)
    }
  }
}

//#endregion

//#region acquire source

const typeForm = document.getElementById('type-form')

const typeInput = generateInput(() => {
  const formData = new FormData(typeForm)
  const type = formData.get('type')
  return type ? ({ available: true, value: type }) : ({ available: false, value: null })
}, 500)

const type = (await typeInput.next()).value

import { lookupSourceInput } from './input.mjs'
const { element:sourceForm, getValue:getSource, closeModal } = await lookupSourceInput[type]()

const sourceInput = generateInput(() => {
  const formData = new FormData(sourceForm)
  const sourceId = formData.get('source')
  return sourceId 
    ? ({ available: true, value: sourceId }) 
    : ({ available: false, value: null })
}, 500)

const sourceId = (await sourceInput.next()).value
const source = getSource(sourceId)

closeModal()

const typeFieldset = typeForm.querySelector('fieldset')
typeFieldset.disabled = true

//#endregion

//#region acquire destination

import { renderDestinationInput } from './input.mjs'
const destinationForm = document.getElementById('destination-form')
const getDestination = await renderDestinationInput(destinationForm)

const destinationInput = generateInput(() => {
  const formData = new FormData(destinationForm)
  const destinationId = formData.get(destinationForm.name)
  return destinationId 
    ? ({ available: true, value: destinationId }) 
    : ({ available: false, value: destinationId })
}, 500)

const destinationId = (await destinationInput.next()).value
const destination = getDestination(destinationId)

const destinationFieldset = destinationForm.querySelector('fieldset')
destinationFieldset.disabled = true

//#endregion

//#region parse, transform, trasfer

window.parsed = []

import { lookupParse } from './parse.mjs'
const { startParsing, stopParsing } = lookupParse[type]

import { transformTransfer } from './transform-transfer.mjs'

//#endregion

//#region trigger

const startStopButton = document.getElementById('start-stop-button')
let running = false
let timerId
const timerDuration = 2000

const process = () => {
  transformTransfer(window.parsed)
  timerId = setTimeout(process, timerDuration)
}

startStopButton.onclick = () => {
  if (running) {
    stopParsing(source)
    clearTimeout(timerId)
    startStopButton.innerText = 'Start'
  }
  else{
    startParsing(source, window.parsed)
    timerId = setTimeout(process, timerDuration)
    startStopButton.innerText = 'Stop'
  }
  running = !running
}

startStopButton.toggleAttribute('disabled')

//#endregion



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