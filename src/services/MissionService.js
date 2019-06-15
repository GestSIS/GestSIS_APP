import Api from '@/services/Api'

export default {
  getMissions() {
    return Api().get('/mission-types/')
  }
}
