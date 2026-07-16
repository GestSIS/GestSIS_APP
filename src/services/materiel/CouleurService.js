import Api from "/src/http/Request";

export default {
  getCouleurs() {
    return Api.api().get("/couleurs");
  },
  addCouleur(couleur) {
    return Api.api().post("/couleurs", couleur);
  },
  updateCouleur(couleur) {
    return Api.api().put(`/couleurs/${couleur.id}`, couleur);
  },
  removeCouleur(couleurId) {
    return Api.api().delete(`/couleurs/${couleurId}`);
  },
};
