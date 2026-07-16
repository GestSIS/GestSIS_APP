import Api from "/src/http/Request";

export default {
  getTravaux(exerciceComptableId) {
    return Api.api().get(`/travaux/${exerciceComptableId}`);
  },
  addTravaux(travaux) {
    return Api.api().post("/travaux", { travaux });
  },
  updateTravail(travail) {
    return Api.api().put(`/travaux/${travail.id}`, travail);
  },
  reviewTravail(travail) {
    return Api.api().post(`/travaux/${travail.id}/review`, travail);
  },
  cancelReviewTravail(travailId) {
    return Api.api().delete(`/travaux/${travailId}/review`);
  },
  removeTravail(travailId) {
    return Api.api().delete(`/travaux/${travailId}`);
  },
};
