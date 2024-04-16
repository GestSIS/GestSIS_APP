import Api from '/src/http/Request';

export default {
  getStatCivilite(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/civilite`);
  },
  getStatFonction(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/fonction`);
  },
  getStatGrade(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/grade`);
  },
  getStatPermis(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/permis`);
  },
  getStatVehicule(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/vehicule`);
  },
  getStatMateriel(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/materiel`);
  },
  getStatPresencesExercice(exercieComptableId) {
    return Api.api().get(
      `/statistiques/${exercieComptableId}/presence-exercice`
    );
  },
  getStatPresencesIntervention(exercieComptableId) {
    return Api.api().get(
      `/statistiques/${exercieComptableId}/presence-intervention`
    );
  },
  getStatTypeIntervention(exercieComptableId) {
    return Api.api().get(
      `/statistiques/${exercieComptableId}/type-intervention`
    );
  },
  getStatStatFederal(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/stat-federal`);
  },
  getStatTraitementIntervention(exercieComptableId) {
    return Api.api().get(
      `/statistiques/${exercieComptableId}/intervention-traitement`
    );
  },
  getStatCategorieComptable(exercieComptableId) {
    return Api.api().get(
      `/statistiques/${exercieComptableId}/categorie-comptable`
    );
  },
  getStatCompte(exercieComptableId) {
    return Api.api().get(`/statistiques/${exercieComptableId}/compte`);
  },
  getStatModuleComptable(exercieComptableId) {
    return Api.api().get(
      `/statistiques/${exercieComptableId}/module-comptable`
    );
  },
};
