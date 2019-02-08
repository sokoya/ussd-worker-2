const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(morgan('tiny'))

const db = []
const getLastId = () => db.length ? db[db.length-1].id : 0
const [PENDING, DONE] = [0, 1]

app.get('/ussd-requests', (req, res) => {
  const status = req.query.status
  const data = status ? db.filter(doc => doc.status.toString() === status) : db

  res.send(data)
})

app.post('/ussd-requests', (req, res) => {
  const { code, choices } = req.body

  const newUssdRequest = { id: getLastId()+1, code, choices, status: PENDING }
  db.push(newUssdRequest)

  res.send({ ...newUssdRequest })
})

app.put('/ussd-requests/:id', (req, res) => {
  const { result } = req.body
  const id = req.params.id

  for(let i in db) {
    if(db[i].id.toString() === id) {
      db[i] = { ...db[i], result, status: DONE }
      return res.send(db[i])
    }
  }

})

const port = 3000
app.listen(port, () => console.log(`app is listening on port ${port}`))