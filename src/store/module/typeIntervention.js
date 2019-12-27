import types from '../mutationTypes';
import TypeInterventionService from '../../services/TypeInterventionService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_TYPE_INTERVENTION_LIST](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    }
  },
  getters: {
    getTypeIntervention: state => type_intervention_id =>
      state.liste.filter(t => t.id === type_intervention_id)[0]
  },
  actions: {
    fetchTypeInterventions({ commit }) {
      return TypeInterventionService.getTypes().then(data =>
        commit(types.UPDATE_TYPE_INTERVENTION_LIST, data)
      );
    }
  }
};
