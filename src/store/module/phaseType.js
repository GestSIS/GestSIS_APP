import types from '../mutationTypes';
import PhaseTypeService from '../../services/PhaseTypeService.js';

export default {
  state: {
    liste: [],
    active: {
      id: null,
      data: {},
    },
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
    [types.UPDATE_CURRENT_PHASE](state, payload) {
      state.active.data = payload;
      state.active.id = payload.id;
    },
  },
  actions: {
    fetchPhaseTypes({ commit }) {
      return PhaseTypeService.getPhases().then((data) =>
        commit(types.UPDATE_PHASE_TYPE_LISTE, data)
      );
    },
    updateActivePhase({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_PHASE, payload);
    },
    resetActivePhase({ commit }) {
      return commit(types.UPDATE_CURRENT_PHASE, {
        debut: null,
        id: null,
        phase_type_id: null,
      });
    },
  },
};
