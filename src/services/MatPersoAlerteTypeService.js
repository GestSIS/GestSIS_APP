import Api from '/src/http/Request';

export default {
  getAlertes() {
    return Api.api().get('/mat-perso-alerte-types');
  },
  addAlerte(alerte) {
    return Api.api().post('/mat-perso-alerte-types', alerte);
  },
  updateAlerte(alerte) {
    return Api.api().put(`/mat-perso-alerte-types/${alerte.id}`, alerte);
  },
  removeAlerte(alerteId) {
    return Api.api().delete(`/mat-perso-alerte-types/${alerteId}`);
  },
};
