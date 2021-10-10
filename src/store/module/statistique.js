import types from '../mutationTypes';
import StatistiqueService from '../../services/StatistiqueService';

export default {
  state: {
    materiels:[],
    vehicules:[],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.materiels = [];
      state.vehicules = [];
    },
    [types.UPDATE_VEHICULE_INTERVENTION_OCCURENCE](state, payload) {
      state.vehicules = payload;
    },
    [types.UPDATE_MATERIEL_INTERVENTION_OCCURENCE](state, payload) {
      state.materiels = payload;
    },
  },
  actions: {
    fetchVehiculeOccurence({ getters, commit }) {
      return StatistiqueService.getVehiculeOccurence(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_VEHICULE_INTERVENTION_OCCURENCE, data));
    },
    fetchMaterielOccurence({ getters, commit }) {
      return StatistiqueService.getMaterielOccurence(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_MATERIEL_INTERVENTION_OCCURENCE, data));
    },
  }
};
