import Api from '@/services/Api'

export default {
  login(payload) {
    return Api.auth().post('/login', payload)
  },
  register(payload) {
    return Api.auth().post('/register', payload)
  },
  refreshToken(payload) {
    return Api.auth().post('refresh-token', payload)
  }
}
