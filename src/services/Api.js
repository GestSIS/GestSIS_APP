import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api/v2'
const AUTH_URL = 'http://127.0.0.1:8001/api/v1'

const api = {
  _401interceptor: null,

  setAccessToken: token => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },

  set401Interceptor(refreshToken, refreshFailed){
    this._401interceptor = axios.interceptors.response.use(null, error => {
      if (error.config && error.response && error.response.status === 401) {
        return refreshToken().then(() => {
          return axios.request(error.config).catch(refreshFailed)
        })
      }

      return Promise.reject(error)
    })
  },

  remove401Interceptor(){
    axios.interceptors.response.eject(this._401interceptor)
  },

  api: () => {
    let api = axios.create({
      baseURL: API_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })

    api.interceptors.response.use(
      function(response) {
        console.log("Interceptor stupid")
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
  },

  auth: () => {
    let auth = axios.create({
      baseURL: AUTH_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    })

    auth.interceptors.response.use(
      function(response) {
        console.log(response)
        if (response.status === 401) {
          console.log("Throw error status")
          throw response.data
        }
        console.log("No error in interceptor")
        return response.data
      },
      function(error) {
        // Do something with response error
        return Promise.reject(error)
      }
    )

    return auth
  }
}

export default api