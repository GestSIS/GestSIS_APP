import Api from '@/http/Request';

export default {
  getInterventions(exerciceComptableId) {
    return Api.api().get('/interventions', {
      params: { exercice_comptable_id: exerciceComptableId },
    });
  },
  getIntervention(interventionId) {
    return Api.api().get('/interventions/' + interventionId);
  },
  getSapeurs(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/sapeurs');
  },
  getGroupes(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/groupes');
  },
  getQuittances(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/quittances');
  },
  getMateriels(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/materiels');
  },
  getVehicules(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/vehicules');
  },
  getMissions(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/missions');
  },
  getAppels(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/appels');
  },
  getPhases(interventionId) {
    return Api.api().get('/interventions/' + interventionId + '/phases');
  },
  createIntervention(interventionData) {
    return Api.api().post('/interventions', interventionData);
  },
  removeIntervention(interventionId) {
    return Api.api().delete('/interventions/' + interventionId);
  },
  validerIntervention(interventionId) {
    return Api.api().post('/interventions/' + interventionId + '/valider');
  },
  saveIntervention(interventionId, interventionData) {
    return Api.api().put('/interventions/' + interventionId, interventionData);
  },

  //Matériel
  addMateriel(interventionId, materielData) {
    return Api.api().post('/interventions/' + interventionId + '/materiels', {
      materiels: [materielData],
    });
  },
  editMateriel(interventionId, materielData) {
    return Api.api().put('/interventions/' + interventionId + '/materiels', {
      materiels: [materielData],
    });
  },
  removeMateriel(interventionId, materielId) {
    return Api.api().delete(
      '/interventions/' + interventionId + '/materiels',
      {
        data: { materiels: [materielId] },
      }
    );
  },

  //Vehicules
  addVehicules(interventionId, vehiculesData) {
    return Api.api().post('/interventions/' + interventionId + '/vehicules', {
      vehicules: vehiculesData,
    });
  },
  removeVehicules(interventionId, vehiculesId) {
    return Api.api().delete(
      '/interventions/' + interventionId + '/vehicules',
      {
        data: { vehicules: vehiculesId },
      }
    );
  },

  //Groupes
  addGroupes(interventionId, groupesData) {
    return Api.api().post('/interventions/' + interventionId + '/groupes', {
      groupes: groupesData,
    });
  },
  removeGroupes(interventionId, groupesId) {
    return Api.api().delete('/interventions/' + interventionId + '/groupes', {
      data: { groupes: groupesId },
    });
  },

  //Quittances
  addQuittances(interventionId, quittancesData) {
    return Api.api().post('/interventions/' + interventionId + '/quittances', {
      quittances: quittancesData,
    });
  },
  removeQuittances(interventionId, quittancesId) {
    return Api.api().delete(
      '/interventions/' + interventionId + '/quittances',
      {
        data: { quittances: quittancesId },
      }
    );
  },

  //Sapeurs
  addSapeurs(interventionId, sapeursData) {
    return Api.api().post(
      '/interventions/' + interventionId + '/sapeurs',
      sapeursData
    );
  },
  editSapeurs(interventionId, sapeursData) {
    return Api.api().put(
      '/interventions/' + interventionId + '/sapeurs',
      sapeursData
    );
  },
  removeSapeurs(interventionId, sapeursIds) {
    return Api.api().delete('/interventions/' + interventionId + '/sapeurs', {
      data: sapeursIds,
    });
  },

  //Appel
  addAppel(interventionId, appelData) {
    return Api.api().post('/interventions/' + interventionId + '/appels', {
      appels: [appelData],
    });
  },
  editAppel(interventionId, appelData) {
    return Api.api().put('/interventions/' + interventionId + '/appels', {
      appels: [appelData],
    });
  },
  removeAppel(interventionId, appelId) {
    return Api.api().delete('/interventions/' + interventionId + '/appels', {
      data: { appels: [appelId] },
    });
  },

  //Mission
  addMission(interventionId, missionData) {
    return Api.api().post('/interventions/' + interventionId + '/missions', {
      missions: [missionData],
    });
  },
  editMission(interventionId, missionData) {
    return Api.api().put('/interventions/' + interventionId + '/missions', {
      missions: [missionData],
    });
  },
  removeMission(interventionId, missionId) {
    return Api.api().delete('/interventions/' + interventionId + '/missions', {
      data: { missions: [missionId] },
    });
  },

  //Phase
  addPhase(interventionId, phaseData) {
    return Api.api().post('/interventions/' + interventionId + '/phases', {
      phases: [phaseData],
    });
  },
  editPhase(interventionId, phaseData) {
    return Api.api().put('/interventions/' + interventionId + '/phases', {
      phases: [phaseData],
    });
  },
  removePhase(interventionId, phaseId) {
    return Api.api().delete('/interventions/' + interventionId + '/phases', {
      data: { phases: [phaseId] },
    });
  },

  // Rapport d'intervention
  downloadRapport(interventionId, params) {
    return Api.apiFileDownload('rapport.pdf').post(
      '/interventions/' + interventionId + '/rapport',
      params
    );
  },
};
