import { http } from './utils.mjs'

const app = new Vue({
  el: '#app',
  data: {
    newUssdRequest: '',
    ussdRequests: []
  },
  methods: {
    addUssdRequest: async function() {
      const value = this.newUssdRequest && this.newUssdRequest.trim()
      if(!value) { return }

      const [code, ...choices] = value.split('-').map(s => s.trim())
      const ussdRequest = await http.post('/ussd-requests', { code, choices })

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