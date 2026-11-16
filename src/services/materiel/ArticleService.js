import Api from "/src/http/Request";

// Date du jour (YYYY-MM-DD, heure locale), valeur par défaut de la date de suppression.
const aujourdhui = () => new Date().toLocaleDateString("sv-SE");

export default {
  creerArticles(articles) {
    return Api.api().post(`articles`, { articles });
  },
  updateArticles(articles) {
    return Api.api().put(`articles`, { articles });
  },
  supprimerArticles(articleIds, date = aujourdhui(), remarque = null) {
    return Api.api().delete(`articles`, { data: { articleIds, date, remarque } });
  },
  supprimerLot({ materiel_type_id, emplacement_id, compartiment, quantite, date, remarque }) {
    return Api.api().post(`articles/supprimer-lot`, {
      materiel_type_id,
      emplacement_id,
      compartiment,
      quantite,
      date,
      remarque,
    });
  },
  restaurerArticles(articleIds, emplacementId) {
    return Api.api().post(`articles/restaurer`, { articleIds, emplacement_id: emplacementId });
  },
  getAttributionsArticle(articleId) {
    return Api.api().get(`articles/${articleId}/attributions`);
  },
  getAttributionsSapeur(sapeurId) {
    return Api.api().get(`sapeurs/${sapeurId}/attributions`);
  },
  attribuerArticles(sapeurId, articles) {
    return Api.api().post(`sapeurs/${sapeurId}/articles`, articles);
  },
  retourArticles(emplacementId, articles) {
    return Api.api().post(`emplacements/${emplacementId}/articles`, articles);
  },
  downloadListeArticles(sapeurId, filename) {
    return Api.apiFileDownload(filename).get(`sapeurs/${sapeurId}/liste-articles`);
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
  getARecuperer() {
    return Api.api().get(`articles/a-recuperer`);
  },
};
