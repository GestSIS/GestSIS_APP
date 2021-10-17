import Api from '@/http/Request';

export default {
  getVehiculeOccurence(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/vehicule`);
  },
  getMaterielOccurence(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/materiel`);
  },
  getPresences(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/presence`);
  },
};
