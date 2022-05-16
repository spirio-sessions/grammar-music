import express from 'express'
import fs from 'fs'

const app = express()

app.use(logRequest)
app.use(express.static('static'))
app.use(express.json())

app.get('/review', (_, res) => {
  fs.readFile('static/review.html', (err, data) => {
    if (err)
      res.sendStatus(500)
    else
      res
        .status(200)
        .type('html')
        .send(data)
  })
})

app.get('/id', (_, res) => {
  const counter = nextCounter()
  const today = new Date()

  res
    .status(200)
    .type('json')
    // month + 1 because january = 0
    .json({id: `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}-${counter}`})
})

app.post('/protocol', (req, res) => {
  const id = req.query.id
  const protocol = req.body

  if (!(id && protocol)) {
    res.sendStatus(400)
    return
  }

  const text = JSON.stringify(protocol, null, 4)

  fs.writeFile(`protocols/${id}.json`, text, err => {
    if (err)
      res.sendStatus(500)
    else
      res.sendStatus(200)
  })
})

app.get('/protocol', (req, res) => {
  const id = req.query.id
  
  fs.readFile(`protocols/${id}.json`, (err, data) => {
    if (err)
      res.sendStatus(404)
    else
      res
        .status(200)
        .type('json')
        .send(data)
  })
})

app.get('/protocol/ids', (_, res) => {
  fs.readdir('protocols', (err, filenames) => {
    if (err)
      res.sendStatus(404)
    else
      res
        .status(200)
        .type('json')
        .json(filenames.map(fn => fn.split('.')[0]))
  })
})

function logRequest(req, _, next) {
  console.log(`${new Date().toISOString()}\t${req.method}\t${req.url}\t${getRemoteIp()}`)
  
  next()

  function getRemoteIp() {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress
  }
}

function nextCounter() {
  const filePath = 'nextCounter'
  let counter

  if (fs.existsSync(filePath)) {
    try {
      const counterString = fs.readFileSync(filePath)
      counter = Number.parseInt(counterString)
    }
    catch(err) {
      throw new Error('could not retrieve counter: ' + err)
    }
      
    try {
      const nextCounterString = `${counter+1}`
      fs.writeFileSync(filePath, nextCounterString)
    }
    catch(err) {
      throw new Error('could not set new counter: ' + err)
    }
  }
  else {
    try {
      fs.writeFileSync(filePath, `${1}`)
      counter = 0
    }
    catch(err) {
      throw new Error('could not set new counter: ' + err)
    }
  }

  return counter
}

export { app as default }
