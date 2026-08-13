import Api from "/src/http/Request";

export default {
  // Jeton de recrutement
  getToken() {
    return Api.api().get("/recrutement/token");
  },
  genererToken(dureeHeures) {
    return Api.api().post("/recrutement/token", { duree_heures: dureeHeures });
  },
  invaliderToken() {
    return Api.api().delete("/recrutement/token");
  },

  // Formulaire public (route non authentifiée côté backend, cf. RecrutementController)
  verifierFormulaire(sisKey, token) {
    return Api.api().get(`/recrutement/${sisKey}/${token}`);
  },
  soumettreFormulaire(sisKey, token, recrueData) {
    return Api.api().post(`/recrutement/${sisKey}/${token}`, recrueData);
  },

  // Validation d'une recrue (fourrier, authentifié)
  validerRecrue(recrueId, incorporation) {
    return Api.api().post(`/recrues/${recrueId}/valider`, { incorporation });
  },
};
