import Api from '/src/http/Request';

export default {
  getTypes() {
    return Api.api().get('/materiel-types');
  },
  addType(type) {
    return Api.api().post('/materiel-types', type);
  },
  updateType(type) {
    return Api.api().put(`/materiel-types/${type.id}`, type);
  },
  removeType(typeId) {
    return Api.api().delete(`/materiel-types/${typeId}`);
  },
};
