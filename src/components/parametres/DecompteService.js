import Api from '@/http/Request';

export default {
  getDecomptes(exerciceComptableId) {
    return Api.api().get(
      `/decomptes/exercice-comptable/${exerciceComptableId}`
    );
  },
  creerDecompte(params) {
    return Api.api().post('decomptes/create', params);
  },
  removeDecompte(decompteId) {
    return Api.api().delete(`decomptes/${decompteId}`);
  },
  genererDecompteAnnuel(params) {
    return Api.api().post('decomptes/creer-annuel', params);
  },
  genererDecompteSapeur(params) {
    return Api.api().post('decomptes/creer-sapeur', params);
  },
  genererDecompteExercice(params) {
    return Api.api().post('decomptes/creer-exercice', params);
  },
  downloadDecompte(decompteId, filename) {
    return Api.apiFileDownload(filename).get(`/decomptes/${decompteId}/print`);
  },
  downloadIso20022PourDecompte(decompteId, filename) {
    return Api.apiFileDownload(filename).get(
      `/decomptes/${decompteId}/iso20022`
    );
  },
  downloadIso20022PourPaiement(paiementId, filename) {
    return Api.apiFileDownload(filename).get(
      `/paiements/${paiementId}/iso20022`
    );
  },
};
