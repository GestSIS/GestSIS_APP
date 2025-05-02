import Api from '/src/http/Request';

export default {
  creerArticles(articles) {
    return Api.api().post(`articles`, { articles });
  },
  attribuerArticles(sapeurId, articles) {
    return Api.api().post(`sapeurs/${sapeurId}/articles`, articles);
  },
  getParMaterielType(materieltypeId) {
    return Api.api().get(`materiel-types/${materieltypeId}/articles`);
  },
  getParEmplacement(emplacementId) {
    return Api.api().get(`emplacements/${emplacementId}/articles`);
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
