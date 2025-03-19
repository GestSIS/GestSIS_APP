import Api from '/src/http/Request';

export default {
  getParMaterielType(materieltypeId) {
    return Api.api().get(`materiel-types/${materieltypeId}/articles`);
  },
  getParSapeur(sapeurId) {
    return Api.api().get(`sapeurs/${sapeurId}/articles`);
  },
  getAttribuable() {
    return Api.api().get(`articles?attribuable=true`);
  },
  retourArticles(params) {
    return Api.api().delete(`sapeurs/articles`, params);
  },
};
