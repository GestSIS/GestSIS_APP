import Api from "/src/http/Request";

export default {
  getMesInfos() {
    return Api.api().get("/mes-infos");
  },
  getMesFonctions() {
    return Api.api().get("/mes-fonctions");
  },
  getMesGrades() {
    return Api.api().get("/mes-grades");
  },
  getMesGroupes() {
    return Api.api().get("/mes-groupes");
  },
  getMesMutations() {
    return Api.api().get("/mes-mutations");
  },
  getMesCours() {
    return Api.api().get("/mes-cours");
  },
  getMesPermis() {
    return Api.api().get("/mes-permis");
  },
  getMonMateriel() {
    return Api.api().get("/mon-materiel");
  },
  getMesTravaux(exerciceComptableId) {
    return Api.api().get("/mes-travaux/" + exerciceComptableId);
  },
  getMesExercices(exerciceComptableId) {
    return Api.api().get("/mes-exercices/" + exerciceComptableId);
  },
  getMesProchainsExercices() {
    return Api.api().get("/mes-prochains-exercices");
  },
  getMesControlesMedicaux() {
    return Api.api().get("/mes-controles-medicaux");
  },
  downloadMonJustificatif(controleMedicalId, filename) {
    return Api.apiFileDownload(filename).get("/mon-justificatif/" + controleMedicalId);
  },
  getMesAbsences(exerciceComptableId) {
    return Api.api().get("/mes-absences/" + exerciceComptableId);
  },
  getMesInterventions(exerciceComptableId) {
    return Api.api().get("/mes-interventions/" + exerciceComptableId);
  },
  getMesDecomptes(exerciceComptableId) {
    return Api.api().get("/mes-decomptes/" + exerciceComptableId);
  },
  printMonDecompte(decompteId, filename) {
    return Api.apiFileDownload(filename).get(`/mes-decomptes/${decompteId}/print`);
  },
  downloadMonResumeAnnuel(exerciceComptableId, filename) {
    return Api.apiFileDownload(filename).get(
      `mes-exercices-comptable/${exerciceComptableId}/print`,
    );
  },
  downloadMonCertificatSalaire(exerciceComptableId, filename) {
    return Api.apiFileDownload(filename).get(`/mon-certificat-salaire/${exerciceComptableId}`);
  },
};
