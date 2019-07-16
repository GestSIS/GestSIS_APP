import Api from '@/services/Api'

export default {
  getCours() {
    return Api.api().get('/cours/')
  }
}
