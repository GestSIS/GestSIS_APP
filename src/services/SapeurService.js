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
  getMutations(sapeurId) {
    return Api().get('/sapeurs/' + sapeurId + '/mutations')
  },
  saveSapeur(sapeurId, sapeurData) {
    return Api().put('/sapeurs/' + sapeurId, sapeurData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  addTelephone(sapeurId, telephoneData) {
    return Api().post('/sapeurs/' + sapeurId + '/telephones/', telephoneData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editTelephone(sapeurId, telephoneData) {
    console.log(telephoneData)
    return Api().put(
      '/sapeurs/' + sapeurId + '/telephones/' + telephoneData.id,
      telephoneData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeTelephone(sapeurId, telephoneId) {
    return Api().delete('/sapeurs/' + sapeurId + '/telephones/' + telephoneId)
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
