import express from 'express'
import fs from 'fs'

const app = express()
const port = 8080

app.use(express.static('static'))
app.use(express.json())

let nextId = 0
app.get('/id', (req, res) => {
  if (req.query.lastId && typeof(req.query.lastId) === 'string')
    nextId = Number.parseInt(req.query.lastId) + 1

  const today = new Date()

  res
    .status(200)
    .type('json')
    .json({id: `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}-${nextId}`})

  nextId++
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

app.listen(port, () => {
  console.log(`grammar music listening on port ${port}`)
})
