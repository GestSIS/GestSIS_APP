import Api from '/src/http/Request';

export default {
  getTypes() {
    return Api.api().get('/mat-perso-types');
  },
  addType(type) {
    return Api.api().post('/mat-perso-types', type);
  },
  updateType(type) {
    return Api.api().put(`/mat-perso-types/${type.id}`, type);
  },
  removeType(typeId) {
    return Api.api().delete(`/mat-perso-types/${typeId}`);
  },
};
