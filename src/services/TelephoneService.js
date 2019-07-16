import Api from '@/services/Api'

export default {
  getTelephones() {
    return Api.api().get('/telephones/')
  }
}
