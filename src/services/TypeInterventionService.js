import Api from '@/services/Api'

export default {
  getTypes() {
    return Api.api().get('/type-intervention/')
  }
}
