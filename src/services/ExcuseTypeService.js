import Api from '@/http/Request';

export default {
  getExcuses() {
    return Api.api().get('/excuses-types');
  },
  addExcuse(excuse) {
    return Api.api().post('/excuses-types', excuse);
  },
  updateExcuse(excuse) {
    return Api.api().put(`/excuses-types/${excuse.id}`, excuse);
  },
  removeExcuse(excuse_id) {
    return Api.api().delete(`/excuses-types/${excuse_id}`);
  },
};
