import Api from '@/services/Api'

export default {
  getExercices() {
    return Api().get('/exercices/')
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
    return Api().post('/exercices/' + exercieId + '/sapeurss/', sapeursData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editSapeurs(exercieId, sapeursData) {
    return Api().put('/exercices/' + exercieId + '/sapeurs/', sapeursData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  removeSapeurs(exercieId, sapeursIds) {
    return Api().delete('/exercices/' + exercieId + '/sapeurs/', sapeursIds, {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
