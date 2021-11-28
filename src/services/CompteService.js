import Api from '@/http/Request';

export default {
  getComptes() {
    return Api.api().get('/comptes');
  },
  addCompte(compte) {
    return Api.api().post('/comptes', compte);
  },
  updateCompte(compte) {
    return Api.api().put(`/comptes/${compte.id}`, compte);
  },
  removeCompte(compteId) {
    return Api.api().delete(`/comptes/${compteId}`);
  },
  downloadJustificatifIndividuel(filename, exerciceComptableId, compteId) {
    return Api.apiFileDownload(filename).get(
      `/exercices-comptable/${exerciceComptableId}/comptes/${compteId}/justificatif`
    );
  },
  downloadJustificatifComplet(filename, exerciceComptableId) {
    return Api.apiFileDownload(filename).get(
      `/exercices-comptable/${exerciceComptableId}/justificatif`
    );
  },
};
