import types from '../mutationTypes';
import TelephoneService from '../../services/TelephoneService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_TELEPHONE_LISTE](state, payload) {
      state.liste = payload;
    }
  },
  actions: {
    fetchTelephones({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return TelephoneService.getTelephones().then(data =>
          commit(types.UPDATE_TELEPHONE_LISTE, data)
        );
      }
    }
  }
};
