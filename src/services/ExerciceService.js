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
  saveSapeur(sapeurId, sapeurData) {
    return Api().put('/sapeurs/' + sapeurId, sapeurData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  addSapeurs(sapeurId, sapeursData) {
    return Api().post('/sapeurs/' + sapeurId + '/sapeurss/', sapeursData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  editSapeurs(sapeurId, sapeursData) {
    return Api().put('/sapeurs/' + sapeurId + '/sapeurs/', sapeursData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  removeSapeurs(sapeurId, sapeursIds) {
    return Api().delete('/sapeurs/' + sapeurId + '/sapeurs/', sapeursIds, {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
