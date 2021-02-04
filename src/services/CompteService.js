import Api from '@/http/Request';

export default {
  getComptes() {
    return Api.api().get('/comptes/');
  },
  addCompte(compte) {
    return Api.api().post('/comptes/', compte);
  },
  updateCompte(compte) {
    return Api.api().put(`/comptes/${compte.id}`, compte);
  },
  removeCompte(compte_id) {
    return Api.api().delete(`/comptes/${compte_id}`);
  },
};
