import Api from '@/http/Request';

export default {
  addEcriture(ecriture) {
    return Api.api().post('/ecritures', ecriture);
  },
  updateEcriture(ecriture) {
    return Api.api().put('/ecritures/' + ecriture.id, ecriture);
  },
  removeEcriture(ecritureId) {
    return Api.api().delete('/ecritures/' + ecritureId);
  },

  getExerciceEcriturePourExerciceComptable(exerciceComptableId) {
    return Api.api().get('/ecritures/exercices/' + exerciceComptableId);
  },
  getFraisIndemniteTypes() {
    return Api.api().get('/frais-indemnites-types');
  },
  annulerImputationExercice(exerciceId) {
    return Api.api().delete('/imputation/exercice/' + exerciceId);
  },
  imputerExercice(exerciceId, payload) {
    return Api.api().post('/imputation/exercice/' + exerciceId, payload);
  },
  annulerImputationIntervention(interventionId) {
    return Api.api().delete('/imputation/intervention/' + interventionId);
  },
  imputerIntervention(interventionId, payload) {
    return Api.api().post(
      '/imputation/intervention/' + interventionId,
      payload
    );
  },
  addFraisIndemniteAnnuel(fraisIndemnite) {
    return Api.api().post('/frais-indemnites-annuel', fraisIndemnite);
  },
  updateFraisIndemniteAnnuel(fraisIndemnite) {
    return Api.api().put(
      `/frais-indemnites-annuel/${fraisIndemnite.id}`,
      fraisIndemnite
    );
  },
  removeFraisIndemniteAnnuel(fraisIndemniteId) {
    return Api.api().delete(`/frais-indemnites-annuel/${fraisIndemniteId}`);
  },
  addFraisIndemniteAnnuelType(fraisIndemnite) {
    return Api.api().post('/frais-indemnites-annuel-types', fraisIndemnite);
  },
  updateFraisIndemniteAnnuelType(fraisIndemnite) {
    return Api.api().put(
      `/frais-indemnites-annuel-types/${fraisIndemnite.id}`,
      fraisIndemnite
    );
  },
  removeFraisIndemniteAnnuelType(fraisIndemniteId) {
    return Api.api().delete(
      `/frais-indemnites-annuel-types/${fraisIndemniteId}`
    );
  },
  addIndemniteExercice(indemnite) {
    return Api.api().post('/indemnites-exercice-types', indemnite);
  },
  updateIndemniteExercice(indemnite) {
    return Api.api().put(
      `/indemnites-exercice-types/${indemnite.id}`,
      indemnite
    );
  },
  removeIndemniteExercice(indemniteId) {
    return Api.api().delete(`/indemnites-exercice-types/${indemniteId}`);
  },
  addIndemniteIntervention(indemnite) {
    return Api.api().post('/indemnites-intervention-types', indemnite);
  },
  updateIndemniteIntervention(indemnite) {
    return Api.api().put(
      `/indemnites-intervention-types/${indemnite.id}`,
      indemnite
    );
  },
  removeIndemniteIntervention(indemniteId) {
    return Api.api().delete(`/indemnites-intervention-types/${indemniteId}`);
  },
  imputerAnnuel(exerciceComptableId) {
    return Api.api().post('/imputation/annuel/' + exerciceComptableId);
  },
  annulerImputationAnnuel(exerciceComptableId) {
    return Api.api().delete(`/imputation/annuel/${exerciceComptableId}`);
  },
  getEcritureForCompte(compteId, exerciceComptableId) {
    return Api.api().get(
      `comptes/${compteId}/ecritures/${exerciceComptableId}`
    );
  },
  getEcrituresForExercice(exerciceId) {
    return Api.api().get('/ecritures/exercice/' + exerciceId);
  },
  getEcrituresForInterventions(interventionId) {
    return Api.api().get('/ecritures/intervention/' + interventionId);
  },
  getEcrituresForExerciceComptable(exerciceComptableId) {
    return Api.api().get('/ecritures/' + exerciceComptableId);
  },
  getEcrituresAnnuelsForExerciceComptable(exerciceComtableId) {
    return Api.api().get('/ecritures/annuel/' + exerciceComtableId);
  },
  getEcrituresDiversForExerciceComptable(exerciceComtableId) {
    return Api.api().get('/ecritures/divers/' + exerciceComtableId);
  },
  getAmendesForExerciceComptable(exerciceComptableId) {
    return Api.api().get('/ecritures/amende/' + exerciceComptableId);
  },
  genererAmendesAnnuels(exerciceComptableId) {
    return Api.api().post('/generer-amendes/' + exerciceComptableId);
  },
  genererAmendesPourSapeur(exerciceComptableId, sapeurId) {
    return Api.api().post(
      '/generer-amendes/' + exerciceComptableId + '/sapeur/' + sapeurId
    );
  },
};
