//#region input generation

import { sleep } from './util.mjs'

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

//#region trigger

window.tokenized = []

import { lookupTokenize } from './tokenize.mjs'
const { startTokenizing, stopTokenizing } = lookupTokenize[type]

import { transformTransfer } from './transform-transfer.mjs'

const startStopButton = document.getElementById('start-stop-button')
let running = false

const timerDuration = 2000 // ms
let timerId

const process = () => {
  transformTransfer(window.tokenized, destination)
  timerId = setTimeout(process, timerDuration)
}

startStopButton.onclick = () => {
  if (running) {
    stopTokenizing(source)
    clearTimeout(timerId)
    startStopButton.innerText = 'Start'
  }
  else{
    startTokenizing(source, window.tokenized)
    timerId = setTimeout(process, timerDuration)
    startStopButton.innerText = 'Stop'
  }
  running = !running
}

startStopButton.toggleAttribute('disabled')

//#endregion
