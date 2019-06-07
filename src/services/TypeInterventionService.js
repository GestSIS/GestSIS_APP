import Api from '@/services/Api'

export default {
  getTypes() {
    return Api().get('/type-intervention/')
  }
}
