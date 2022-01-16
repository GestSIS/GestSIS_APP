import types from '../mutationTypes';
import StatistiqueService from '../../services/StatistiqueService';

export default {
  state: {
    materiels: [],
    vehicules: [],
    presences: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.materiels = [];
      state.vehicules = [];
      state.presences = [];
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
  },
  actions: {
    fetchStatistiqueVehicule({ getters, commit }) {
      return StatistiqueService.getVehiculeOccurence(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_VEHICULE, data));
    },
    fetchStatistiqueMateriel({ getters, commit }) {
      return StatistiqueService.getMaterielOccurence(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_MATERIEL, data));
    },
    fetchStatistiquePresence({ getters, commit }) {
      return StatistiqueService.getPresences(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_PRESENCE, data));
    },
  },
};
