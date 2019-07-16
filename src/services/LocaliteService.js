import Api from '@/services/Api'

export default {
  getLocalites() {
    return Api.api().get('/localites/')
  }
}
