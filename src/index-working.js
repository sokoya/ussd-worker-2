var ip = require("ip");
const express = require('express')
require('express-async-errors');
const bodyParser = require('body-parser')
const morgan = require('morgan')
const PORT= process.env.PORT || '8080' 
const app = express();
app.set("port", PORT);
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(morgan('tiny'))

const http = require('https');

/**
 * @type {Array<{
 *   id: number,
 *   type: string,
 *   code: string,
 *   choices: string[],
 *   result?: string,
 *   status: number
 *  }>}
 */
const db = []
const getLastId = () => db.length ? db[db.length-1].id : 0
const [PENDING, DONE] = [0, 1]

// filter to get the result...
app.get('/ussd-requests', (req, res) => {
  const { id, status, type } = req.query
  if(id){
    var result  = "Approved Manually";
    for(let i in db) {
        if(db[i].id.toString() === id) {
          db[i] = { ...db[i], result, status: DONE }
          return res.send(db[i])
        }
    }
  }
  const data = (() => {
    if(type && status) {
      return db
        .filter(doc => doc.status.toString() === status)
        .filter(doc => doc.type === type)
    }

    if(type) { return db.filter(doc => doc.type === type) }
    if(status) { return db.filter(doc => doc.status.toString() === status) }

    return db
  })()

  res.send(data)
})


// Get single transaction detail.
app.get('/get-transaction', (req, res) => {
  const { id, status, type } = req.query
  if(id){
    for(let i in db) {
        if(db[i].id.toString() === id) {
          return res.send(db[i])
        }
    }
  }
})

// post ussd to the ussd worker app
app.post('/ussd-requests', (req, res) => {
  const {  id, code, choices, type } = req.body
  
  const newUssdRequest = { id, code, choices, type, status: PENDING }
  db.push(newUssdRequest)

  res.send({ ...newUssdRequest })
})

// update the heroku app base on the result got from the ussd worker.
app.put('/ussd-requests/:id', (req, res) => {

  const { result } = req.body
  const id = req.params.id
  // we can have req.body.result, req.body.id and POST
  // curl -X POST -d "{\"name\": \"Jack\", \"text\": \"HULLO\"}" -H "Content-Type: application/json" http://localhost:3000/api
  
  for(let i in db) {
    if(db[i].id.toString() === id) {
      db[i] = { ...db[i], result, status: DONE }
      // webhook...
      const postData = JSON.stringify({trans_id: req.body.id, remark: req.body.result})
      const options = {
        hostname: 'www.payscribe.ng',
        path: '/webhook/airtime_response',
        method: 'POST',
        port : '443',
        headers: {
            'content-type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
      };
      const webbookRequest = http.request(options, (webhookResponse) => {
        webhookResponse.setEncoding('utf8');
        webhookResponse.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
        });
        webhookResponse.on('end', () => {
            console.log('No more data in response.');
        });
      });
      // getaddrinfo ENOTFOUND https://www.payscribe.ng
      webbookRequest.on('error', (e) => {
        console.error(`problem with webhook request: ${e.message}`);
      });
      // Write data to request body
      webbookRequest.write(postData);
      webbookRequest.end();

      // finally log to db
      return res.send(db[i])
    }
  }
})


app.use((err, req, res, next) => {
  
  if (res.headersSent) { 
    return next(err) 
  }
  res.status(500)
  res.json({ message: err.message })
})


app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`)
  console.log('Available on:')
  console.log(` • http://localhost:${PORT}`)
  console.log(` • http://${ip.address()}:${PORT}`)
  console.log('\n')
})