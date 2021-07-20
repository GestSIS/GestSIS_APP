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
  downloadDecompteIso20022(decompteId, params) {
    return Api.apiFileDownload().post(
      `/decomptes/${decompteId}/iso20022`,
      params
    );
  },
  genererDecompteAnnuel(params) {
    return Api.api().post('decomptes/creer-annuel', params);
    // TODO: Refresh data en cas de succès afin d'avoir des données à jour
  },
  genererDecompteSapeur(params) {
    return Api.api().post('decomptes/creer-sapeur', params);
    // TODO: Refresh data en cas de succès afin d'avoir des données à jour
  },
  genererDecompteExercice(params) {
    return Api.api().post('decomptes/creer-exercice', params);
    // TODO: Refresh data en cas de succès afin d'avoir des données à jour
  },
};
