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
  },
  actions: {
    fetchStatistiqueVehicule({ getters, commit }) {
      return StatistiqueService.getStatVehicule(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_VEHICULE, data));
    },
    fetchStatistiqueMateriel({ getters, commit }) {
      return StatistiqueService.getStatMateriel(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_MATERIEL, data));
    },
    fetchStatistiquePresence({ getters, commit }) {
      return StatistiqueService.getStatPresences(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_PRESENCE, data));
    },
    fetchStatistiqueTypeIntervention({ getters, commit }) {
      return StatistiqueService.getStatTypeIntervention(
        getters.currentExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_TYPE_INTERVENTION, data)
      );
    },
    fetchStatistiqueStatFederal({ getters, commit }) {
      return StatistiqueService.getStatStatFederal(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_STAT_FEDERAL, data));
    },
    fetchStatistiqueTraitementIntervention({ getters, commit }) {
      return StatistiqueService.getStatTraitementIntervention(
        getters.currentExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_INTERVENTION_TRAITEMENT, data)
      );
    },
  },
};
