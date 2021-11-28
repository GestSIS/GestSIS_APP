import Api from '@/http/Request';

export default {
  getPermisType() {
    return Api.api().get('/permis');
  },
  getCivilites() {
    return Api.api().get('/civilites');
  },
  getTelephones() {
    return Api.api().get('/telephone-types');
  },
};
