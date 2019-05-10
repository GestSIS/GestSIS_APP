import Api from '@/services/Api'

export default {
  getSapeurs() {
    return Api().get('/sapeurs/')
  },
  getSapeur(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId)
  }
}
