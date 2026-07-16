import Api from "/src/http/Request";

export default {
  getAlertes() {
    return Api.api().get("/mat-perso-alertes");
  },
  addAlerte(alerte) {
    return Api.api().post("/mat-perso-alertes", alerte);
  },
  updateAlerte(alerte) {
    return Api.api().put(`/mat-perso-alertes/${alerte.id}`, alerte);
  },
  removeAlerte(alerteId) {
    return Api.api().delete(`/mat-perso-alertes/${alerteId}`);
  },
};
