import Api from '@/http/Request';

export default {
  getExerciceEcriturePourExerciceComptable(exerciceComptableId) {
    return Api.api().get('/ecritures/exercices/' + exerciceComptableId);
  },
  getIndemniteTypes() {
    return Api.api().get('/indemnites-types');
  },
  getFraisTypes() {
    return Api.api().get('/frais-types');
  },
  imputerExercice(exerciceId, payload) {
    return Api.api().post('/imputation/exercice/' + exerciceId, payload);
  },
  imputerIntervention(interventionId, payload) {
    return Api.api().post(
      '/imputation/intervention/' + interventionId,
      payload
    );
  },
  addFraisAnnuel(frais) {
    return Api.api().post('/frais-annuel', frais);
  },
  updateFraisAnnuel(frais) {
    return Api.api().put(`/frais-annuel/${frais.id}`, frais);
  },
  removeFraisAnnuel(frais_id) {
    return Api.api().delete(`/frais-annuel/${frais_id}`);
  },
  addIndemniteAnnuel(indemnite) {
    return Api.api().post('/indemnites-annuel', indemnite);
  },
  updateIndemniteAnnuel(indemnite) {
    return Api.api().put(`/indemnites-annuel/${indemnite.id}`, indemnite);
  },
  removeIndemniteAnnuel(indemnite_id) {
    return Api.api().delete(`/indemnites-annuel/${indemnite_id}`);
  },
  addFraisAnnuelType(frais) {
    return Api.api().post('/frais-annuel-types', frais);
  },
  updateFraisAnnuelType(frais) {
    return Api.api().put(`/frais-annuel-types/${frais.id}`, frais);
  },
  removeFraisAnnuelType(frais_id) {
    return Api.api().delete(`/frais-annuel-types/${frais_id}`);
  },
  addIndemniteAnnuelType(indemnite) {
    return Api.api().post('/indemnites-annuel-types', indemnite);
  },
  updateIndemniteAnnuelType(indemnite) {
    return Api.api().put(`/indemnites-annuel-types/${indemnite.id}`, indemnite);
  },
  removeIndemniteAnnuelType(indemnite_id) {
    return Api.api().delete(`/indemnites-annuel-types/${indemnite_id}`);
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
  removeIndemniteExercice(indemnite_id) {
    return Api.api().delete(`/indemnites-exercice-types/${indemnite_id}`);
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
  removeIndemniteIntervention(indemnite_id) {
    return Api.api().delete(`/indemnites-intervention-types/${indemnite_id}`);
  },
  imputerAnnuel(exerciceComptableId) {
    return Api.api().post('/imputation/annuel/' + exerciceComptableId);
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
