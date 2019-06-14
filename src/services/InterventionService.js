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

  //Matériel
  addMateriel(interventionId, materielData) {
    return Api().post(
      '/interventions/' + interventionId + '/materiels/',
      { materiels: [materielData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  editMateriel(interventionId, materielData) {
    return Api().put(
      '/interventions/' + interventionId + '/materiels/',
      { materiels: [materielData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeMateriel(interventionId, materielId) {
    return Api().delete('/interventions/' + interventionId + '/materiels/', {
      data: { materiels: [materielId] }
    })
  },

  //Vehicules
  addVehicules(interventionId, vehiculesData) {
    return Api().post(
      '/interventions/' + interventionId + '/vehicules/',
      { vehicules: vehiculesData },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeVehicules(interventionId, vehiculesId) {
    return Api().delete('/interventions/' + interventionId + '/vehicules/', {
      data: { vehicules: vehiculesId }
    })
  },

  //Sapeurs
  addSapeurs(interventionId, sapeursData) {
    return Api().post(
      '/interventions/' + interventionId + '/sapeurs/',
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
