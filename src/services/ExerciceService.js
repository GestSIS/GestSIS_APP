import Api from '@/services/Api'

export default {
  getExercices(exerciceComptableId) {
    return Api.api().get('/exercices', {
      params: { exercice_comptable_id: exerciceComptableId }
    })
  },
  getExercice(exerciceId) {
    return Api.api().get('/exercices/' + exerciceId)
  },
  getSapeurs(exerciceId) {
    return Api.api().get('/exercices/' + exerciceId + '/sapeurs')
  },
  createExercice(exerciceData) {
    return Api.api().post('/exercices/', exerciceData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  validerExercice(exerciceId) {
    return Api.api().post('/exercices/' + exerciceId + '/valider')
  },
  saveExercice(exerciceId, exerciceData) {
    return Api.api().put('/exercices/' + exerciceId, exerciceData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  addSapeurs(exercieId, sapeursData) {
    return Api.api().post('/exercices/' + exercieId + '/sapeurs/', sapeursData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editSapeurs(exercieId, sapeursData) {
    return Api.api().put('/exercices/' + exercieId + '/sapeurs/', sapeursData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  removeSapeurs(exercieId, sapeursIds) {
    return Api.api().delete(
      '/exercices/' + exercieId + '/sapeurs/',
      { data: sapeursIds },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
