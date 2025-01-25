import types from '../mutationTypes';
import ConvocationParamService from '../../services/ConvocationParamService.js';

export default {
  state: {
    params: null,
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.params = null;
    },
    [types.UPDATE_CONVOCATION_PARAMS](state, payload) {
      state.params = payload;
    },
  },
  actions: {
    fetchConvocationParams({ state, commit }) {
      if (state.params === null) {
        return ConvocationParamService.getParams().then((data) => {
          commit(types.UPDATE_CONVOCATION_PARAMS, data);
          return data;
        });
      }
      return Promise.resolve(true);
    },
    updateConvocationParams({ commit }, params) {
      return ConvocationParamService.updateParams(params).then((data) => {
        commit(types.UPDATE_CONVOCATION_PARAMS, data);
        return data;
      });
    },
  },
};
