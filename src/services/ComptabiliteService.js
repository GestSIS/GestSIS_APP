import Api from '@/http/Request';

export default {
  getIndemniteTypes() {
    return Api.api().get('/indemnites-types/');
  },
  getFraisTypes() {
    return Api.api().get('/frais-types/');
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
  imputerAnnuel(exerciceComptableId) {
    return Api.api().post('/imputation/annuel/' + exerciceComptableId);
  },
  getUnites() {
    return Api.api().get('/unites/');
  },
  getComptes() {
    return Api.api().get('/comptes/');
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
