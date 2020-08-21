import types from '../mutationTypes';
import InterventionTraitementService from '../../services/InterventionTraitementService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_INTERVENTION_TRAITEMENT_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    }
  },
  getters: {
    getInterventionTraitement: state => intervention_traitement_id =>
      state.liste.filter(t => t.id === intervention_traitement_id)[0]
  },
  actions: {
    fetchInterventionTraitements({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return InterventionTraitementService.getStats().then(data =>
          commit(types.UPDATE_INTERVENTION_TRAITEMENT_LISTE, data)
        );
      }
    }
  }
};
