import Api from "/src/http/Request";

export default {
  getTravaux(exerciceComptableId) {
    return Api.api().get(`/travaux/${exerciceComptableId}`);
  },
  getEvenements(exerciceComptableId) {
    return Api.api().get(`/travaux/evenements/${exerciceComptableId}`);
  },
  getTravauxIntervention(interventionId) {
    return Api.api().get(`/interventions/${interventionId}/travaux`);
  },
  getTravauxExercice(exerciceId) {
    return Api.api().get(`/exercices/${exerciceId}/travaux`);
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
