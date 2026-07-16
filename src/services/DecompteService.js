import Api from "/src/http/Request";

export default {
  getDecomptes(exerciceComptableId) {
    return Api.api().get(`/decomptes/exercice-comptable/${exerciceComptableId}`);
  },
  creerDecompte(params) {
    return Api.api().post("decomptes/create", params);
  },
  removeDecompte(decompteId) {
    return Api.api().delete(`decomptes/${decompteId}`);
  },
  genererDecompteAnnuel(params) {
    return Api.api().post("decomptes/creer-annuel", params);
  },
  genererDecompteSapeur(params) {
    return Api.api().post("decomptes/creer-sapeur", params);
  },
  genererDecompteExercice(params) {
    return Api.api().post("decomptes/creer-exercice", params);
  },
  getEcritures(decompteId) {
    return Api.api().get(`decomptes/${decompteId}/ecritures`);
  },
  downloadResumePourSapeur(exerciceComptableId, sapeurId, filename) {
    return Api.apiFileDownload(filename).get(
      `/exercices-comptable/${exerciceComptableId}/resume-pour-sapeur/${sapeurId}`,
    );
  },
  downloadResumeParSapeur(exerciceComptableId, filename) {
    return Api.apiFileDownload(filename).get(
      `/exercices-comptable/${exerciceComptableId}/resume-par-sapeur`,
    );
  },
  downloadDecompte(decompteId, filename) {
    return Api.apiFileDownload(filename).get(`/decomptes/${decompteId}/print`);
  },
  downloadDecompteParSapeur(decompteId, filename) {
    return Api.apiFileDownload(filename).get(`/decomptes/${decompteId}/print-par-sapeur`);
  },
  downloadDecompteParCompte(decompteId, filename) {
    return Api.api(filename).get(`/decomptes/${decompteId}/print-par-compte`);
  },
  downloadIso20022PourDecompte(decompteId, filename) {
    return Api.apiFileDownload(filename).get(`/decomptes/${decompteId}/iso20022`);
  },
  downloadExcelAFacturer(decompteId, filename) {
    return Api.apiFileDownload(filename).get(`/decomptes/${decompteId}/a-facturer`);
  },
  downloadExcelEcritures(decompteId, filename) {
    return Api.apiFileDownload(filename).get(`/decomptes/${decompteId}/export-ecritures`);
  },
  downloadCertificatSalaires(exerciceComptableId, filename) {
    return Api.apiFileDownload(filename).get(
      `/exercices-comptable/${exerciceComptableId}/certificat-salaire`,
    );
  },
  downloadCertificatSalaireSapeur(exerciceComptableId, sapeurId, filename) {
    return Api.apiFileDownload(filename).get(
      `/exercices-comptable/${exerciceComptableId}/certificat-salaire/${sapeurId}`,
    );
  },
};
