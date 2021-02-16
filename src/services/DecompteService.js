import Api from '@/http/Request';

export default {
  getDecomptes(exerciceComptableId) {
    return Api.api().get(
      `/decomptes/exercice-comptable/${exerciceComptableId}`
    );
  },
  downloadDecompteIso20022(decompteId, params) {
    return Api.apiFileDownload().post(
      `/decomptes/${decompteId}/iso20022`,
      params
    );
  },
  creerDecompte(param) {
    return Api.api().post('decomptes/create', param);
  },
};
