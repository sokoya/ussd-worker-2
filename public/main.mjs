import { http } from './utils.mjs'

const app = new Vue({
  el: '#app',
  data: {
    newUssdRequest: '', // The Choices (USSD)
    newUssdRequestType: '', // type either SIM 1 or 2 ( 1 or 2)
    ussdRequests: []
  },
  methods: {
    addUssdRequest: async function() {
      const id = Math.random()
      // check if the type and message body is not empty
      if(!this.newUssdRequest || !this.newUssdRequestType) { return }

      // where code is *123# and choices can be *1, *4 ... with  -
      // const [code, ...choices] = this.newUssdRequest.split('-').map(s => s.trim())
      const [code, ...choices] = this.newUssdRequest.split('-').map(s => s.trim().toString())
      const type = this.newUssdRequestType
      const ussdRequest = await http.post('/ussd-requests', { id, code, choices, type })

      this.ussdRequests.push(ussdRequest)
      this.newUssdRequest = ''
    }
  }
})

const refresh = async () => {
  app.ussdRequests = await http.get('/ussd-requests')
}

refresh()
setInterval(refresh, 15 * 1000)