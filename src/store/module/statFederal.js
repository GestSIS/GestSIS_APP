import types from '../mutationTypes';
import StatFederalService from '../../services/StatFederalService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_STAT_FEDERAL_LIST](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    }
  },
  getters: {
    listStatFederal: state => state.liste.slice(0),
    getStatFederal: state => type_intervention_id =>
      state.liste.filter(t => t.id === type_intervention_id)[0]
  },
  actions: {
    fetchStatFederals({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return StatFederalService.getStats().then(data =>
          commit(types.UPDATE_STAT_FEDERAL_LIST, data)
        );
      }
    }
  }
};
