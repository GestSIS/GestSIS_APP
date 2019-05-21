import Api from '@/services/Api'

export default {
  getSapeurs() {
    return Api().get('/sapeurs/')
  },
  getData(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId)
  },
  getPermis(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + "/permis")
  },
  getTelephones(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + "/telephones")
  },
  getGroupes(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + "/groupes")
  }
}
