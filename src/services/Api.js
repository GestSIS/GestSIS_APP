import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api/v2'

export default () => {
  let api = axios.create({
    baseURL: API_URL,
    withCredentials: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  api.interceptors.response.use(
    function(response) {
      if (response.data.error !== undefined) {
        throw response.data.error
      }
      return response.data.data
    },
    function(error) {
      // Do something with response error
      return Promise.reject(error)
    }
  )
  return api
}
