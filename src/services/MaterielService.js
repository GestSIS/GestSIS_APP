import Api from '@/services/Api'

export default {
  getMateriels() {
    return Api.api().get('/materiels/')
  }
}
