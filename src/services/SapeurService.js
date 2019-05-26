import Api from '@/services/Api'

export default {
  getSapeurs() {
    return Api().get('/sapeurs/')
  },
  getData(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId)
  },
  getPermis(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + '/permis')
  },
  getTelephones(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + '/telephones')
  },
  getGroupes(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + '/groupes')
  },
  getGrades(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + '/grades')
  },
  getFonctions(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + '/fonctions')
  },
  getCours(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + '/cours')
  },
  saveSapeur(sapeurId, sapeurData) {
    return Api().put('/sapeurs/' + sapeurId, sapeurData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  addPermis(sapeurId, permisData) {
    return Api().post('/sapeurs/' + sapeurId + '/permis/', permisData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editPermis(sapeurId, permisData) {
    return Api().put(
      '/sapeurs/' + sapeurId + '/permis/' + permisData.permis_id,
      permisData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removePermis(sapeurId, permisId) {
    return Api().delete('/sapeurs/' + sapeurId + '/permis/' + permisId)
  }
}
