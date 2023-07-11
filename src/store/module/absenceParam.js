import types from '../mutationTypes';
import AbsenceParamService from '../../services/AbsenceParamService.js';

export default {
  state: {
    params: null,
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.params = null;
    },
    [types.UPDATE_ABSENCE_PARAMS](state, payload) {
      state.params = payload;
    },
  },
  actions: {
    fetchAbsenceParams({ state, commit }) {
      if (state.params === null) {
        return AbsenceParamService.getParams().then((data) =>
          commit(types.UPDATE_ABSENCE_PARAMS, data)
        );
      }
    },
    updateAbsenceParams({ commit }, params) {
      return AbsenceParamService.updateParams(params).then((data) => {
        commit(types.UPDATE_ABSENCE_PARAMS, data);
        return data;
      });
    },
  },
};
