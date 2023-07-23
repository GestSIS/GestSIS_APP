import Api from '/src/http/Request';

export default {
  getMesInfos() {
    return Api.api().get('/mes-infos');
  },
  getMesFonctions() {
    return Api.api().get('/mes-fonctions');
  },
  getMesGrades() {
    return Api.api().get('/mes-grades');
  },
  getMesGroupes() {
    return Api.api().get('/mes-groupes');
  },
  getMesMutations() {
    return Api.api().get('/mes-mutations');
  },
  getMesCours() {
    return Api.api().get('/mes-cours');
  },
  getMonMateriel() {
    return Api.api().get('/mon-materiel');
  },
  getMesTravaux(exerciceComptableId) {
    return Api.api().get('/mes-travaux/' + exerciceComptableId);
  },
  getMesExercices(exerciceComptableId) {
    return Api.api().get('/mes-exercices/' + exerciceComptableId);
  },
  getMesAbsences(exerciceComptableId) {
    return Api.api().get('/mes-absences/' + exerciceComptableId);
  },
  getMesInterventions(exerciceComptableId) {
    return Api.api().get('/mes-interventions/' + exerciceComptableId);
  },
  getMesDecomptes(exerciceComptableId) {
    return Api.api().get('/mes-decomptes/' + exerciceComptableId);
  },
  printMonDecompte(decompteId, filename) {
    return Api.print(filename).get(`/mes-decomptes/${decompteId}/print`);
  },
  downloadMonCertificatSalaire(exerciceComptableId, filename) {
    return Api.apiFileDownload(filename).get(
      `/mon-certificat-salaire/${exerciceComptableId}`
    );
  },
};
