import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api/v2'
const AUTH_URL = 'http://127.0.0.1:8001/api/v1'

import store from '@/store'

const request = {
  _401interceptor: true,
  _refreshToken: null,
  _refreshFailed: null,

  setAccessToken: token => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  },

  api() {
    let api = axios.create({
      baseURL: API_URL,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })

    api.interceptors.response.use(
      response => {
        if (response.data.error !== undefined) {
          throw response.data.error
        }
        return response.data.data
      },
      async error => {
        if (error.config && error.response && error.response.status === 401) {
          // Refresh the access token
          try {
            await store.dispatch('refreshToken')

            error.config.headers.Authorization = `Bearer ${
              axios.defaults.headers.common['Authorization']
            }`

            // Retry the original request
            return axios({
              method: error.config.method,
              url: error.config.url,
              data: error.config.data
            }).then(response => {
              return response.data.data
            })
          } catch (e) {
            // Refresh has failed - reject the original request
            throw error
          }
        }

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
        'Content-Type': 'application/json'
      }
    })

    auth.interceptors.response.use(
      function(response) {
        if (response.status === 401) {
          throw response.data
        }
        return response.data
      },
      function(error) {
        // Do something with response error
        return Promise.reject(error.response.data)
      }
    )

    return auth
  }
}

export default request
