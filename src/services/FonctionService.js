import Api from '@/services/Api'

export default {
  getFonctions() {
    return Api().get('/fonctions/')
  }
}
