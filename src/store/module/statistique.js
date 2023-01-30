import types from '../mutationTypes';
import StatistiqueService from '../../services/StatistiqueService.js';

export default {
  state: {
    materiels: [],
    vehicules: [],
    statFederal: [],
    typeIntervention: [],
    interventionTraitement: [],
    presences: [],
    comptes: [],
    modulesComptable: [],
    categoriesComptable: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.materiels = [];
      state.vehicules = [];
      state.presences = [];
      state.statFederal = [];
      state.typeIntervention = [];
      state.interventionTraitement = [];
    },
    [types.UPDATE_STATISTIQUE_VEHICULE](state, payload) {
      state.vehicules = payload;
    },
    [types.UPDATE_STATISTIQUE_MATERIEL](state, payload) {
      state.materiels = payload;
    },
    [types.UPDATE_STATISTIQUE_PRESENCE](state, payload) {
      state.presences = payload;
    },
    [types.UPDATE_STATISTIQUE_STAT_FEDERAL](state, payload) {
      state.statFederal = payload;
    },
    [types.UPDATE_STATISTIQUE_TYPE_INTERVENTION](state, payload) {
      state.typeIntervention = payload;
    },
    [types.UPDATE_STATISTIQUE_INTERVENTION_TRAITEMENT](state, payload) {
      state.interventionTraitement = payload;
    },
    [types.UPDATE_STATISTIQUE_COMPTE](state, payload) {
      state.comptes = payload;
    },
    [types.UPDATE_STATISTIQUE_MODULE_COMPTABLE](state, payload) {
      state.modulesComptable = payload;
    },
    [types.UPDATE_STATISTIQUE_CATEGORIE_COMPTABLE](state, payload) {
      state.categoriesComptable = payload;
    },
  },
  actions: {
    fetchStatistiqueCategorieComptable({ getters, commit }) {
      return StatistiqueService.getStatCategorieComptable(
        getters.activeExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_CATEGORIE_COMPTABLE, data));
    },
    fetchStatistiqueCompte({ getters, commit }) {
      return StatistiqueService.getStatCompte(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_COMPTE, data));
    },
    fetchStatistiqueModuleComptable({ getters, commit }) {
      return StatistiqueService.getStatModuleComptable(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_MODULE_COMPTABLE, data));
    },
    fetchStatistiqueVehicule({ getters, commit }) {
      return StatistiqueService.getStatVehicule(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_VEHICULE, data));
    },
    fetchStatistiqueMateriel({ getters, commit }) {
      return StatistiqueService.getStatMateriel(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_MATERIEL, data));
    },
    fetchStatistiquePresence({ getters, commit }) {
      return StatistiqueService.getStatPresences(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_PRESENCE, data));
    },
    fetchStatistiqueTypeIntervention({ getters, commit }) {
      return StatistiqueService.getStatTypeIntervention(
        getters.activeExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_TYPE_INTERVENTION, data)
      );
    },
    fetchStatistiqueStatFederal({ getters, commit }) {
      return StatistiqueService.getStatStatFederal(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_STAT_FEDERAL, data));
    },
    fetchStatistiqueTraitementIntervention({ getters, commit }) {
      return StatistiqueService.getStatTraitementIntervention(
        getters.activeExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_INTERVENTION_TRAITEMENT, data)
      );
    },
  },
};
