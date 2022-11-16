import Api from '@/http/Request';

export default {
  getMesInfos() {
    return Api.api().get('/mes-infos');
  },
  getMesExercices() {
    return Api.api().get('/mes-exercices');
  },
  getMesDecomptes() {
    return Api.api().get('/mes-decomptes');
  },
};
