import types from '../mutationTypes';

export default {
  state: {
    active: {
      id: 0,
      localite_id: 0,
      incorporation: null,
      sortie: null,
      motif: '',
      action: '',
    },
  },
  mutations: {
    [types.UPDATE_CURRENT_MUTATION](state, payload) {
      state.active = payload;
    },
  },
  actions: {
    updateActiveMutation({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_MUTATION, payload);
    },
    resetActiveMutation({ commit }) {
      return commit(types.UPDATE_CURRENT_MUTATION, {
        id: 0,
        localite_id: 0,
        incorporation: null,
        sortie: null,
        motif: '',
      });
    },
  },
};
