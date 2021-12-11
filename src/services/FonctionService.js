import Api from '@/http/Request';

export default {
  getFonctions() {
    return Api.api().get('/fonctions');
  },
  addFonction(fonction) {
    return Api.api().post('/fonctions', fonction);
  },
  updateFonction(fonction) {
    return Api.api().put(`/fonctions/${fonction.id}`, fonction);
  },
  removeFonction(fonction_id) {
    return Api.api().delete(`/fonctions/${fonction_id}`);
  },
};
