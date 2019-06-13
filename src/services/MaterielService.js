import Api from '@/services/Api'

export default {
  getMateriels() {
    return Api().get('/materiels/')
  }
}
