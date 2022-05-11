import types from '../mutationTypes';
import AspsmsParamService from '../../services/AspsmsParamService.js';

export default {
  state: {
    params: null,
    credit: 0,
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.params = null;
    },
    [types.UPDATE_ASPSMS_PARAMS](state, payload) {
      state.params = payload;
    },
    [types.UPDATE_ASPSMS_CREDIT](state, payload) {
      state.credit = parseFloat(payload);
    },
  },
  actions: {
    fetchAspsmsCredit({ state, commit }) {
      if (state.params === null) {
        return AspsmsParamService.getCredit().then((data) =>
          commit(types.UPDATE_ASPSMS_CREDIT, data)
        );
      }
    },
    fetchAspsmsParams({ state, commit }) {
      if (state.params === null) {
        return AspsmsParamService.getParams().then((data) =>
          commit(types.UPDATE_ASPSMS_PARAMS, data)
        );
      }
    },
    updateAspsmsParams({ commit }, params) {
      return AspsmsParamService.updateParams(params).then((data) => {
        commit(types.UPDATE_ASPSMS_PARAMS, { username: params.username });
        return data;
      });
    },
  },
};
