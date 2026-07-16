import Api from "/src/http/Request";

export default {
  getAgriculteurs() {
    return Api.api().get("/rta/agriculteurs");
  },
  getAgriculteur(agriculteurId) {
    return Api.apiFileDownload().get(`/rta/agriculteurs/${agriculteurId}`);
  },
  createAgriculteur(agriculteur) {
    return Api.api().post("/rta/agriculteurs", agriculteur);
  },
  updateAgriculteur(agriculteur) {
    return Api.api().put("/rta/agriculteurs/" + agriculteur.id, agriculteur);
  },
  reorderAgriculteur(agriculteur) {
    return Api.api().put("/rta/agriculteurs/" + agriculteur.id + "/tri", agriculteur);
  },
  deleteAgriculteur(agriculteurId) {
    return Api.api().delete(`/rta/agriculteurs/${agriculteurId}`);
  },
  getFichiers() {
    return Api.api().get("/rta/fichiers");
  },
  downloadFichier(fileId, filename) {
    return Api.apiFileDownload(filename).get(`/rta/fichiers/${fileId}`);
  },
  getDemandes() {
    return Api.api().get("/rta/demandes");
  },
  getReferenceRta() {
    return Api.api().get("/rta/reference");
  },
  getReferenceGestSis() {
    return Api.api().get("/rta/gestsis");
  },
  updateReference(data) {
    return Api.api().post("/rta/reference", data);
  },
};
