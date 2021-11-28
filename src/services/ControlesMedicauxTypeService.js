import Api from '@/http/Request';

export default {
  getTypes() {
    return Api.api().get('/controles-medicaux-types');
  },
  addType(type) {
    return Api.api().post('/controles-medicaux-types', type);
  },
  updateType(type) {
    return Api.api().put(`/controles-medicaux-types/${type.id}`, type);
  },
  removeType(type_id) {
    return Api.api().delete(`/controles-medicaux-types/${type_id}`);
  },
};
