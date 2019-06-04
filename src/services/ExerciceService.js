import Api from '@/services/Api'

export default {
  getExercices() {
    return Api().get('/exercices/')
  },
  getExercice(exercice_id) {
    return Api().get('/exercices/' + exercice_id)
  },
  getSapeurs(exercice_id) {
    return Api().get('/exercices/' + exercice_id + '/sapeurs')
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
