import Api from '@/services/Api'

export default {
  getInterventions(exerciceComptableId) {
    return Api().get('/interventions', {
      params: { exercice_comptable_id: exerciceComptableId }
    })
  },
  getIntervention(interventionId) {
    return Api().get('/interventions/' + interventionId)
  },
  getSapeurs(interventionId) {
    return Api().get('/interventions/' + interventionId + '/sapeurs')
  },
  getMateriels(interventionId) {
    return Api().get('/interventions/' + interventionId + '/materiels')
  },
  getVehicules(interventionId) {
    return Api().get('/interventions/' + interventionId + '/vehicules')
  },
  getMissions(interventionId) {
    return Api().get('/interventions/' + interventionId + '/missions')
  },
  getAppels(interventionId) {
    return Api().get('/interventions/' + interventionId + '/appels')
  },
  createIntervention(interventionData) {
    return Api().post('/interventions/', interventionData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  saveIntervention(interventionId, interventionData) {
    return Api().put('/interventions/' + interventionId, interventionData, {
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
  },

  //Appel
  addAppel(interventionId, appelData) {
    return Api().post(
      '/interventions/' + interventionId + '/appels/',
      { appels: [appelData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  editAppel(interventionId, appelData) {
    return Api().put(
      '/interventions/' + interventionId + '/appels/',
      { appels: [appelData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeAppel(interventionId, appelId) {
    return Api().delete('/interventions/' + interventionId + '/appels/', {
      data: { appels: [appelId] }
    })
  },

  //Mission
  addMission(interventionId, missionData) {
    return Api().post(
      '/interventions/' + interventionId + '/missions/',
      { missions: [missionData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  editMission(interventionId, missionData) {
    return Api().put(
      '/interventions/' + interventionId + '/missions/',
      { missions: [missionData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeMission(interventionId, missionId) {
    return Api().delete('/interventions/' + interventionId + '/missions/', {
      data: { missions: [missionId] }
    })
  }
}
