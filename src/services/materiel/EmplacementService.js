import Api from "/src/http/Request";

export default {
  getEmplacements() {
    return Api.api().get("/emplacements");
  },
  addEmplacement(emplacement) {
    return Api.api().post("/emplacements", emplacement);
  },
  updateEmplacement(emplacement) {
    return Api.api().put(`/emplacements/${emplacement.id}`, emplacement);
  },
  removeEmplacement(emplacementId) {
    return Api.api().delete(`/emplacements/${emplacementId}`);
  },
};
