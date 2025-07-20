import types from '../mutationTypes';
import PhaseTypeService from '../../services/PhaseTypeService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.active = {
        id: null,
        data: {},
      };
    },
    [types.UPDATE_PHASE_TYPE_LISTE](state, payload) {
      state.liste = payload;
    },
  },
  actions: {
    fetchPhaseTypes({ commit }) {
      return PhaseTypeService.getPhases().then((data) =>
        commit(types.UPDATE_PHASE_TYPE_LISTE, data)
      );
    },
  },
};
