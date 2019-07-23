import Api from '@/http/Request'

export default {
  getMateriels() {
    return Api.api().get('/materiels/')
  }
}
