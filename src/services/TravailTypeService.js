import Api from '@/http/Request';

export default {
  getTypes() {
    return Api.api().get('/travail-types');
  },
  addType(type) {
    return Api.api().post('/travail-types', type);
  },
  updateType(type) {
    return Api.api().put(`/travail-types/${type.id}`, type);
  },
  removeType(type_id) {
    return Api.api().delete(`/travail-types/${type_id}`);
  },
};
