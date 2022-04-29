import fs from 'fs'
import https from 'https'
import app from './app.js'

const port = 443

https
  .createServer({
    key: fs.readFileSync('/etc/letsencrypt/live/v2202204174877188737.powersrv.de/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/v2202204174877188737.powersrv.de/fullchain.pem')
  }, app)
  .listen(port, _ => {
    console.log(`grammar music listening on port ${port}`)
  })
