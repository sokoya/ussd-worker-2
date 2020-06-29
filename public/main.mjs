import { http } from './utils.mjs'

const app = new Vue({
  el: '#app',
  data: {
    newUssdRequest: '',
    newUssdRequestType: '',
    ussdRequests: []
  },
  methods: {
    addUssdRequest: async function() {
      const id = 29292
      if(!this.newUssdRequest || !this.newUssdRequestType) { return }

      const [code, ...choices] = this.newUssdRequest.split('-').map(s => s.trim())
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