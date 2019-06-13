import Api from '@/services/Api'

export default {
  getInterventions(exerciceComptableId) {
    return Api().get('/interventions', {
      params: { exercice_comptable_id: exerciceComptableId }
    })
  },
  getIntervention(exerciceId) {
    return Api().get('/interventions/' + exerciceId)
  },
  getSapeurs(exerciceId) {
    return Api().get('/interventions/' + exerciceId + '/sapeurs')
  },
  getMateriels(exerciceId) {
    return Api().get('/interventions/' + exerciceId + '/materiels')
  },
  getVehicules(exerciceId) {
    return Api().get('/interventions/' + exerciceId + '/vehicules')
  },
  createIntervention(exerciceData) {
    return Api().post('/interventions/', exerciceData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  saveIntervention(exerciceId, exerciceData) {
    return Api().put('/interventions/' + exerciceId, exerciceData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  addSapeurs(interventionId, sapeursData) {
    return Api().post(
      '/interventions/' + interventionId + '/sapeurss/',
      sapeursData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  editSapeurs(interventionId, sapeursData) {
    return Api().put(
      '/interventions/' + interventionId + '/sapeurs/',
      sapeursData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeSapeurs(interventionId, sapeursIds) {
    return Api().delete(
      '/interventions/' + interventionId + '/sapeurs/',
      sapeursIds,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
