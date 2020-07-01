const baseURL = 'https://ussd-worker.herokuapp.com'
const genericURL = 'https://www.payscribe.ng'

export const http = {
  get: (url) => {
    return fetch(baseURL + url).then(res => res.json())
  },
  post: (url, data = {}) => {
    return fetch(baseURL + url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
  },
  generic: (url, data = {}) => {
    return fetch(genericURL + url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
  },
}