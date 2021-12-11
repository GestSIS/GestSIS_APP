import Api from '@/http/Request';

export default {
  getUnites() {
    return Api.api().get('/unites');
  },
  addUnite(unites) {
    return Api.api().post('/unites', unites);
  },
  updateUnite(unites) {
    return Api.api().put(`/unites/${unites.id}`, unites);
  },
  removeUnite(unites_id) {
    return Api.api().delete(`/unites/${unites_id}`);
  },
};
