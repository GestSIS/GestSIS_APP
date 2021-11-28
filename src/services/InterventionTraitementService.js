import Api from '@/http/Request';

export default {
  getTraitements() {
    return Api.api().get('/intervention-traitement');
  },
  addTraitement(traitement) {
    return Api.api().post('/intervention-traitement', traitement);
  },
  updateTraitement(traitement) {
    return Api.api().put(
      `/intervention-traitement/${traitement.id}`,
      traitement
    );
  },
  removeTraitement(traitement_id) {
    return Api.api().delete(`/intervention-traitement/${traitement_id}`);
  },
};
