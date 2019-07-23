import Api from '@/http/Request'

export default {
  getInterventions(exerciceComptableId) {
    return Api.api().get('/interventions', {
      params: { exercice_comptable_id: exerciceComptableId }
    })
  },
  getIntervention(interventionId) {
    return Api.api().get('/interventions/' + interventionId)
  },
  getSapeurs(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/sapeurs')
  },
  getQuittances(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/quittances')
  },
  getMateriels(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/materiels')
  },
  getVehicules(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/vehicules')
  },
  getMissions(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/missions')
  },
  getAppels(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/appels')
  },
  getPhases(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/phases')
  },
  createIntervention(interventionData) {
    return Api.api().post('/interventions/', interventionData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },
  validerIntervention(interventionId) {
    return Api.api().post('/interventions/' + interventionId + '/valider')
  },
  saveIntervention(interventionId, interventionData) {
    return Api.api().put('/interventions/' + interventionId, interventionData, {
      headers: { 'Content-Type': 'application/json' }
    })
  },

  //Matériel
  addMateriel(interventionId, materielData) {
    return Api.api().post(
      '/interventions/' + interventionId + '/materiels/',
      { materiels: [materielData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  editMateriel(interventionId, materielData) {
    return Api.api().put(
      '/interventions/' + interventionId + '/materiels/',
      { materiels: [materielData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeMateriel(interventionId, materielId) {
    return Api.api().delete(
      '/interventions/' + interventionId + '/materiels/',
      {
        data: { materiels: [materielId] }
      }
    )
  },

  //Vehicules
  addVehicules(interventionId, vehiculesData) {
    return Api.api().post(
      '/interventions/' + interventionId + '/vehicules/',
      { vehicules: vehiculesData },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeVehicules(interventionId, vehiculesId) {
    return Api.api().delete(
      '/interventions/' + interventionId + '/vehicules/',
      {
        data: { vehicules: vehiculesId }
      }
    )
  },

  //Quittances
  addQuittances(interventionId, quittancesData) {
    return Api.api().post(
      '/interventions/' + interventionId + '/quittances/',
      { quittances: quittancesData },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeQuittances(interventionId, quittancesId) {
    return Api.api().delete(
      '/interventions/' + interventionId + '/quittances/',
      {
        data: { quittances: quittancesId }
      }
    )
  },

  //Sapeurs
  addSapeurs(interventionId, sapeursData) {
    return Api.api().post(
      '/interventions/' + interventionId + '/sapeurs/',
      sapeursData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  editSapeurs(interventionId, sapeursData) {
    return Api.api().put(
      '/interventions/' + interventionId + '/sapeurs/',
      sapeursData,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeSapeurs(interventionId, sapeursIds) {
    return Api.api().delete(
      '/interventions/' + interventionId + '/sapeurs/',
      { data: sapeursIds },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },

  //Appel
  addAppel(interventionId, appelData) {
    return Api.api().post(
      '/interventions/' + interventionId + '/appels/',
      { appels: [appelData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  editAppel(interventionId, appelData) {
    return Api.api().put(
      '/interventions/' + interventionId + '/appels/',
      { appels: [appelData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeAppel(interventionId, appelId) {
    return Api.api().delete('/interventions/' + interventionId + '/appels/', {
      data: { appels: [appelId] }
    })
  },

  //Mission
  addMission(interventionId, missionData) {
    return Api.api().post(
      '/interventions/' + interventionId + '/missions/',
      { missions: [missionData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  editMission(interventionId, missionData) {
    return Api.api().put(
      '/interventions/' + interventionId + '/missions/',
      { missions: [missionData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removeMission(interventionId, missionId) {
    return Api.api().delete('/interventions/' + interventionId + '/missions/', {
      data: { missions: [missionId] }
    })
  },

  //Phase
  addPhase(interventionId, phaseData) {
    return Api.api().post(
      '/interventions/' + interventionId + '/phases/',
      { phases: [phaseData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  editPhase(interventionId, phaseData) {
    return Api.api().put(
      '/interventions/' + interventionId + '/phases/',
      { phases: [phaseData] },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    )
  },
  removePhase(interventionId, phaseId) {
    return Api.api().delete('/interventions/' + interventionId + '/phases/', {
      data: { phases: [phaseId] }
    })
  }
}
