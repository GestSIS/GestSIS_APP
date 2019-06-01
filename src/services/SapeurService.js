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
  },

  addFonction(sapeurId, fonctionData) {
    return Api().post('/sapeurs/' + sapeurId + '/fonctions/', fonctionData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editFonction(sapeurId, fonctionData) {
    return Api().put(
      '/sapeurs/' + sapeurId + '/fonctions/' + fonctionData.id,
      fonctionData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeFonction(sapeurId, fonctionId) {
    return Api().delete('/sapeurs/' + sapeurId + '/fonctions/' + fonctionId)
  },

  addGrade(sapeurId, gradeData) {
    return Api().post('/sapeurs/' + sapeurId + '/grades/', gradeData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editGrade(sapeurId, gradeData) {
    return Api().put(
      '/sapeurs/' + sapeurId + '/grades/' + gradeData.id,
      gradeData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeGrade(sapeurId, gradeId) {
    return Api().delete('/sapeurs/' + sapeurId + '/grades/' + gradeId)
  },

  addCours(sapeurId, coursData) {
    return Api().post('/sapeurs/' + sapeurId + '/cours/', coursData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editCours(sapeurId, coursData) {
    return Api().put(
      '/sapeurs/' + sapeurId + '/cours/' + coursData.id,
      coursData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeCours(sapeurId, coursId) {
    return Api().delete('/sapeurs/' + sapeurId + '/cours/' + coursId)
  },

  addMutation(sapeurId, mutationData) {
    return Api().post('/sapeurs/' + sapeurId + '/mutations/', mutationData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editMutation(sapeurId, mutationData) {
    return Api().put(
      '/sapeurs/' + sapeurId + '/mutations/' + mutationData.id,
      mutationData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeMutation(sapeurId, mutationId) {
    return Api().delete('/sapeurs/' + sapeurId + '/mutations/' + mutationId)
  }
}
