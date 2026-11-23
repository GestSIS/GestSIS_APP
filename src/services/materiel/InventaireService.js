import Api from "/src/http/Request";

export default {
  getInventaires() {
    return Api.api().get("/inventaires");
  },
  getInventaire(inventaireId) {
    return Api.api().get(`/inventaires/${inventaireId}`);
  },
  demarrerInventaire(inventaire) {
    return Api.api().post("/inventaires", inventaire);
  },
  supprimerInventaire(inventaireId) {
    return Api.api().delete(`/inventaires/${inventaireId}`);
  },
  // Saisie : chaque appel renvoie l'inventaire complet (périmètre et lignes).
  ajouterEnPlus(inventaireId, materiel) {
    return Api.api().post(`/inventaires/${inventaireId}/lignes`, materiel);
  },
  modifierLigne(inventaireId, ligneId, modification) {
    return Api.api().put(`/inventaires/${inventaireId}/lignes/${ligneId}`, modification);
  },
  retirerLigne(inventaireId, ligneId) {
    return Api.api().delete(`/inventaires/${inventaireId}/lignes/${ligneId}`);
  },
  compterLot(inventaireId, ligneId, comptage) {
    return Api.api().put(`/inventaires/${inventaireId}/lots/${ligneId}`, comptage);
  },
  validerInventaire(inventaireId, validation) {
    return Api.api().post(`/inventaires/${inventaireId}/valider`, validation);
  },
  // Écarts d'un inventaire validé, comparés au stock actuel
  getEcarts(inventaireId) {
    return Api.api().get(`/inventaires/${inventaireId}/ecarts`);
  },
  // Décision du responsable sur un écart (renvoie les écarts recalculés)
  traiterEcart(inventaireId, traitement) {
    return Api.api().post(`/inventaires/${inventaireId}/ecarts/traiter`, traitement);
  },
  // Article en service portant ce numéro (null si inconnu)
  getArticleParNumero(inventaireId, numero) {
    return Api.api().get(`/inventaires/${inventaireId}/article-par-numero`, { params: { numero } });
  },
  marquerConformes(inventaireId, noeudId) {
    return Api.api().post(`/inventaires/${inventaireId}/emplacements/${noeudId}/conformes`);
  },
};
