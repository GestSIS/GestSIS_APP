import Api from '@/services/Api'

export default {
  getLocalites() {
    return Api().get('/localites/')
  }
}
