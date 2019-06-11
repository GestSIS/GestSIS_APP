import Api from '@/services/Api'

export default {
  getExercices(exerciceComptableId) {
    return Api().get('/exercices', {
      params: { exercice_comptable_id: exerciceComptableId }
    })
  },
  getExercice(exerciceId) {
    return Api().get('/exercices/' + exerciceId)
  },
  getSapeurs(exerciceId) {
    return Api().get('/exercices/' + exerciceId + '/sapeurs')
  },
  createExercice(exerciceData) {
    return Api().post('/exercices/', exerciceData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  saveExercice(exerciceId, exerciceData) {
    return Api().put('/exercices/' + exerciceId, exerciceData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  addSapeurs(exercieId, sapeursData) {
    return Api().post('/exercices/' + exercieId + '/sapeurs/', sapeursData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editSapeurs(exercieId, sapeursData) {
    return Api().put('/exercices/' + exercieId + '/sapeurs/', sapeursData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  removeSapeurs(exercieId, sapeursIds) {
    return Api().delete(
      '/exercices/' + exercieId + '/sapeurs/',
      { data: sapeursIds },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
