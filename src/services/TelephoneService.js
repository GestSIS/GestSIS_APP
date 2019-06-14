import Api from '@/services/Api'

export default {
  getTelephones() {
    return Api().get('/telephones/')
  }
}
