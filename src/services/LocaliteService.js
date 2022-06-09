import Api from '@/http/Request';

export default {
  getLocalites() {
    return Api.api().get('/localites');
  },
  getLocalitesSis() {
    return Api.api().get('/localites-sis');
  },
  addLocalitesSis(ids) {
    return Api.api().post('/localites-sis', ids);
  },
  removeLocalitesSis(ids) {
    return Api.api().delete('/localites-sis', { data: ids });
  },
};
