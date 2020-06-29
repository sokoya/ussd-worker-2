const baseURL = 'https://ussd-worker.herokuapp.com'

export const http = {
  get: (url) => {
    return fetch(baseURL + url).then(res => res.json()).finally(res => console.log('Refreshed', res))
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
    .finally( res => console.log(res))
  }
}