import Api from '@/http/Request';

export default {
  getTypes() {
    return Api.api().get('/type-intervention');
  },
  addType(type) {
    return Api.api().post('/type-intervention', type);
  },
  updateType(type) {
    return Api.api().put(`/type-intervention/${type.id}`, type);
  },
  removeType(type_id) {
    return Api.api().delete(`/type-intervention/${type_id}`);
  },
};
