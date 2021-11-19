// import transform callback / symbolic pipeline

window.running = false
window.melody = []

export async function setupPipeline() {
  switch (window.inputMode) {
    case 'midi':
      await setupMidiPipeline()
      break

    case 'mic':
      await setupMicPipeline()
      break

    case 'file':
      await setupFilePipeline()
      break
  
    default:
      break
  }

  // setup symbolic pipeline with
  setupStartStop()
}

async function setupMidiPipeline() {
  const { initMidiPipeline } = await import('./midi-pipeline.mjs')
  const midiInput = window.inputSource
  initMidiPipeline(midiInput, window.melody)
}

async function setupMicPipeline() {
  const { initMicPipeline } = await import('./mic-pipeline.mjs')
  const inputStream = window.inputSource
  initMicPipeline(inputStream, window.melody)
}

async function setupFilePipeline() {
  const { initFilePipeline } = await import('./file-pipeline.mjs')
  const inputFile = window.inputSource
  initFilePipeline(inputFile, window.melody)
}

function setupStartStop() {
  const button = document.getElementById('start-stop-button')

  const toggleFormsDisabled = () => document.querySelectorAll('form').forEach(form => {
    form.childNodes.forEach(node => {
      node.disabled = !node.disabled
    })
  })
  
  button.onclick = () => {
    if (!window.running) {
      window.running = true
      button.innerText = 'Stop'

      // trigger symbolic pipeline with requestAnimationFrame & imported transform function
      
      toggleFormsDisabled()
    } else {
      window.running = false
      button.innerText = 'Start'

      // stop symbolic pipeline with cancelAnimationFrame & imported transform function
      
      toggleFormsDisabled()
    }
  }
}