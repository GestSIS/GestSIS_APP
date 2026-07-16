import Api from "/src/http/Request";

export default {
  creerArticles(articles) {
    return Api.api().post(`articles`, { articles });
  },
  updateArticles(articles) {
    return Api.api().put(`articles`, { articles });
  },
  supprimerArticles(articleIds) {
    return Api.api().delete(`articles`, { data: { articleIds } });
  },
  attribuerArticles(sapeurId, articles) {
    return Api.api().post(`sapeurs/${sapeurId}/articles`, articles);
  },
  retourArticles(emplacementId, articles) {
    return Api.api().post(`emplacements/${emplacementId}/articles`, articles);
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
  getLavable() {
    return Api.api().get(`articles?lavable=true`);
  },
};
