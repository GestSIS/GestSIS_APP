import types from '../mutationTypes';
import InterventionTraitementService from '../../services/InterventionTraitementService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.UPDATE_INTERVENTION_TRAITEMENT_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
    [types.ADD_INTERVENTION_TRAITEMENT](state, traitement) {
      state.liste = [...state.liste, traitement];
    },
    [types.UPDATE_INTERVENTION_TRAITEMENT](state, traitement) {
      state.liste = [
        ...state.liste.map((m) => (m.id === traitement.id ? traitement : m)),
      ];
    },
    [types.REMOVE_INTERVENTION_TRAITEMENT](state, traitementId) {
      state.liste = state.liste.filter((m) => m.id != traitementId);
    },
  },
  getters: {
    getInterventionTraitement: (state) => (intervention_traitement_id) =>
      state.liste.filter((t) => t.id === intervention_traitement_id)[0],
  },
  actions: {
    fetchInterventionTraitements({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return InterventionTraitementService.getTraitements().then((data) =>
          commit(types.UPDATE_INTERVENTION_TRAITEMENT_LISTE, data)
        );
      }
    },
    addInterventionTraitement({ commit }, traitement) {
      return InterventionTraitementService.addTraitement(traitement).then(
        (data) => {
          commit(types.ADD_INTERVENTION_TRAITEMENT, data);
          return data;
        }
      );
    },
    updateInterventionTraitement({ commit }, traitement) {
      return InterventionTraitementService.updateTraitement(traitement).then(
        (data) => {
          commit(types.UPDATE_INTERVENTION_TRAITEMENT, data);
          return data;
        }
      );
    },
    removeInterventionTraitement({ commit }, traitement) {
      return InterventionTraitementService.removeTraitement(traitement).then(
        (data) => {
          commit(types.REMOVE_INTERVENTION_TRAITEMENT, data);
          return data;
        }
      );
    },
  },
};
