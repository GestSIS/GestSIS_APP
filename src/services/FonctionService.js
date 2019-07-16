import Api from '@/services/Api'

export default {
  getFonctions() {
    return Api.api().get('/fonctions/')
  }
}
