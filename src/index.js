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

app.get('/ussd-requests', (req, res) => {
  const { id, status, type } = req.query
if(id){
  var  result  = "Approved Manually";
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

app.post('/ussd-requests', (req, res) => {
  const {  code, choices, type } = req.body

  const newUssdRequest = { id: getLastId()+1, code, choices, type, status: PENDING }
  db.push(newUssdRequest)

  res.send({ ...newUssdRequest })
})

app.put('/ussd-requests/:id', (req, res) => {
  const { result } = req.body
  const id = req.params.id
  console.log( req )

  for(let i in db) {
    if(db[i].id.toString() === id) {
      db[i] = { ...db[i], result, status: DONE }
      return res.send(db[i])
    }
  }

})

app.use((err, req, res, next) => {
  if (res.headersSent) { return next(err) }
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