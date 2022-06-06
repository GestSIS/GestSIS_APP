import Api from '@/http/Request';

export default {
  getStatVehicule(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/vehicule`);
  },
  getStatMateriel(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/materiel`);
  },
  getStatPresences(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/presence`);
  },
  getStatTypeIntervention(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/type-intervention`);
  },
  getStatStatFederal(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/stat-federal`);
  },
  getStatTraitementIntervention(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/intervention-traitement`);
  },
};
