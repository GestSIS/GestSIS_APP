import axios from 'axios'

const API_URL = 'localhost/api/v2/'

export default () => {
  return axios.create({
    baseURL: API_URL,
    withCredentials: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}
