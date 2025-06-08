import Api from '/src/http/Request';

export default {
  creerLavages(lavages) {
    return Api.api().post(`lavages`, { lavages });
  },
  supprimerLavages(lavageIds) {
    return Api.api().delete(`lavages`, { data: { lavageIds } });
  },
  getDerniersLavages(date) {
    return Api.api().get(`lavages?depuis=${date}`);
  },
  getLavages() {
    return Api.api().get(`lavages`);
  },
};
