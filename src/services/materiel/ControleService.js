import Api from "/src/http/Request";

export default {
  getControles() {
    return Api.api().get("/controles");
  },
  getStatuts() {
    return Api.api().get("/controles/statuts");
  },
  getArticlesAControler() {
    return Api.api().get("/controles/articles-a-controler");
  },
  getArticlesLimiteExecutions() {
    return Api.api().get("/controles/articles-limite-executions");
  },
  addControle(controle) {
    return Api.api().post("/controles", controle);
  },
  updateControle(controle) {
    return Api.api().put(`/controles/${controle.id}`, controle);
  },
  removeControle(controleId) {
    return Api.api().delete(`/controles/${controleId}`);
  },
  addMaterielType(controleId, materielTypeId) {
    return Api.api().post(`/controles/${controleId}/materiel-types`, {
      materiel_type_id: materielTypeId,
    });
  },
  removeMaterielType(controleId, pivotId) {
    return Api.api().delete(`/controles/${controleId}/materiel-types/${pivotId}`);
  },
};
