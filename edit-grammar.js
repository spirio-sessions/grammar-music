let initialText, modal, textarea

export function editGrammar() {
  modal = displayModal()
}

function displayModal() {
  initialText = 
    '[\n' + 
    window.productions
      .map(p => `  [ '${p[0]}' , ${p[1]} , [ ${p[2].map(r => `'${r}'`).join(' , ')} ] ]`)
      .join(' ,\n')
    + '\n]'

  modal = document.createElement('div')
  modal.classList.add('modal')

  textarea = document.createElement('textarea')
  textarea.cols = 80
  textarea.rows = 30
  textarea.style.fontFamily = 'monospace'
  textarea.style.fontSize = 'large'
  textarea.value = initialText
  textarea.autofocus = true

  const button = document.createElement('button')
  button.innerText = 'close'
  button.onclick = onEditingFinished
  button.classList.add('pointer')

  modal.append(textarea, button)

  return document.body.appendChild(modal)
}

function onEditingFinished() {
  const input = textarea.value.trim()

  if (input === initialText) {
    modal.remove()
    return
  }
  
  const error = check(input)
  if (error) {
    alert(error)
    return
  }
  else {
    window.productions = eval(input)
    modal.remove()
  }

  function check(input) {
    if (!input.startsWith('['))
      return 'input is not a valid s-expression in JS'
    else
      return false
  }
}
