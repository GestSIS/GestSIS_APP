import Api from '@/services/Api'

export default {
  getMissions() {
    return Api.api().get('/mission-types/')
  }
}
