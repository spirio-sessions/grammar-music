export const lookupSourceInput = {
  midi
}

async function midi() {
  const midiAccess = await navigator.requestMIDIAccess()
  const inputs = Array
    .from(midiAccess.inputs.values())
    .map(input => ({
      name: input.name,
      value: input.id}))

  const form = createRadioForm('source', inputs)
  const getSource = id => midiAccess.inputs.get(id)
  const closeModal = () => form.parentElement.remove()

  return { element: form, getValue: getSource, closeModal }
}

function createRadioForm(name, options) {
  const modalSeparator = document.createElement('div')
  modalSeparator.classList.add('modal')
  
  const form = document.createElement('form')
  // form.classList.add('modal')

  options.forEach(option => {
    form.append(...createRadioEntry(name, option.name, option.value))
  })

  document.body
    .appendChild(modalSeparator)
    .appendChild(form)

  return form
}

function createRadioEntry(inputName, labelName, id) {
  const radio = document.createElement('input')
  radio.type = 'radio'
  radio.name = inputName
  radio.id = labelName
  radio.value = id
  radio.classList.add('pointer')

  const label = document.createElement('label')
  label.setAttribute('for', labelName)
  label.innerText = labelName
  label.classList.add('pointer')

  const br = document.createElement('br')

  return [ radio, label, br ]
}

export async function renderDestinationInput(form) {
  const midiAccess = await navigator.requestMIDIAccess()
  const outputs = Array
    .from(midiAccess.outputs.values())
    .map(output => ({
      name: output.name,
      value: output.id}))

  const fieldSet = document.createElement('fieldset')
  const legend = document.createElement('legend')
  legend.innerText = 'Destination'

  const name = form.name
  const fieldEntries = outputs
    .map(o => createRadioEntry(name, o.name, o.value))
    .flat()

  fieldSet.append(legend)
  fieldSet.append(...fieldEntries)
  form.append(fieldSet)

  const getDestination = id => midiAccess.outputs.get(id)

  return getDestination
}