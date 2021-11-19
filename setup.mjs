//#region input

window.inputMode = undefined
window.inputSource = undefined

export async function selectInput(form) {
  const data = new FormData(form)
  window.inputMode = data.get('input')

  switch (window.inputMode) {
    case 'midi':
      await modalSetInputMidi()
      break;

    case 'mic':
      await modalSetInputMic()
      break;

    case 'file':
      await modalSetInputFile()
      break;

    default: 
      alert('Input device could not be selected!')
  }
}

async function modalSetInputMidi() {
  const midiAccess = await navigator.requestMIDIAccess()
  const inputs = Array
    .from(midiAccess.inputs)
    .map(entry => ({
      name: entry[1].name,
      id: entry[0]}) )

  createRadioForm(
    'midi', 
    id => window.inputSource = midiAccess.inputs.get(id),
    inputs)
}

async function modalSetInputMic() {
  const deviceInfos = await navigator.mediaDevices.enumerateDevices()
  const mics = deviceInfos
    .filter(device => device.kind === 'audioinput')
    .map(device => ({ name: device.label, id: device.deviceId }) )

  createRadioForm(
    'mic',
    async id => window.inputSource = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: id } }),
    mics
  )
}

function modalSetInputFile() {
  const modalSeparator = document.createElement('div')
  modalSeparator.classList.add('modal')

  const input = document.createElement('input')
  input.type = 'file'
  input.onchange = () => {
    window.inputSource = input.files[0]
    modalSeparator.remove()
  }

  document.body
    .appendChild(modalSeparator)
    .appendChild(input)
}

function createRadioForm(name, handleSelection, options) {
  const modalSeparator = document.createElement('div')
  modalSeparator.classList.add('modal')
  
  const form = document.createElement('form')
  //form.classList.add('modal')

  options.forEach(option => {
    form.append(...createRadioEntry(name, option.name, option.id))
  })

  form.onchange = () => {
    const data = new FormData(form)
    const value = data.get(name)
    handleSelection(value)

    modalSeparator.remove()
    setReady()
  }

  document.body
    .appendChild(modalSeparator)
    .appendChild(form)
}

//#endregion

//#region midi output

window.midiOutput = undefined

export async function setupOutput(form) {
  const midiAccess = await navigator.requestMIDIAccess()
  const outputs = Array
  .from(midiAccess.outputs)
  .map(entry => ({
    name: entry[1].name,
    id: entry[0]}) )

  outputs.forEach(output => {
    form.append(...createRadioEntry('midi-output', output.name, output.id))
  })

  form.onchange = () => {
    const data = new FormData(form)
    const id = data.get('midi-output')
    window.midiOutput = midiAccess.outputs.get(id)

    setReady()
  }
}

//#endregion

function createRadioEntry(inputName, labelName, id) {
  const radio = document.createElement('input')
  radio.type = 'radio'
  radio.name = inputName
  radio.id = labelName
  radio.value = id

  const label = document.createElement('label')
  label.setAttribute('for', labelName)
  label.innerText = labelName

  const br = document.createElement('br')

  return [ radio, label, br ]
}

function setReady() {
  const startStopButton = document.getElementById('start-stop-button')
  const ready = !(window.inputMode && window.inputSource && window.midiOutput)
  startStopButton.disabled = ready
}