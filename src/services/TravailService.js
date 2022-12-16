import Api from '@/http/Request';

export default {
  getTravaux(exerciceComptableId) {
    return Api.api().get(`/travaux/${exerciceComptableId}`);
  },
  addTravaux(travaux) {
    return Api.api().post('/travaux', { travaux });
  },
  updateTravail(travail) {
    return Api.api().put(`/travaux/${travail.id}`, travail);
  },
  reviewTravail(travail) {
    return Api.api().put(`/travaux/${travail.id}/review`, travail);
  },
  removeTravail(travail_id) {
    return Api.api().delete(`/travaux/${travail_id}`);
  },
};
