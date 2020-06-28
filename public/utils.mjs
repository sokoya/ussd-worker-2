const baseURL = 'https://myworker.herokuapp.com'

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
  }
}