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
    [types.UPDATE_ASPSMS_PARAMS](state, { username, password, credit }) {
      state.params = { ...state.params, username, password };
      state.credit = credit;
    },
    [types.UPDATE_ASPSMS_CREDIT](state, payload) {
      state.credit = parseFloat(payload);
    },
  },
  actions: {
    fetchAspsmsCredit({ commit }) {
      return AspsmsParamService.getCredit().then((data) =>
        commit(types.UPDATE_ASPSMS_CREDIT, data)
      );
    },
    fetchAspsmsParams({ dispatch, state, commit }) {
      if (state.params === null) {
        const test = AspsmsParamService.getParams().then((data) => {
          commit(types.UPDATE_ASPSMS_PARAMS, data);
          return data;
        });
        console.log(test)
        return test;
        // return AspsmsParamService.getParams().then((data) =>
        //   commit(types.UPDATE_ASPSMS_PARAMS, data)
        // );
      } else {
        console.log("Test")
        return dispatch('fetchAspsmsCredit');
      }
    },
    updateAspsmsParams({ commit }, params) {
      return AspsmsParamService.updateParams(params).then((data) => {
        commit(types.UPDATE_ASPSMS_PARAMS, { ...params, credit: data.credit });
        return data;
      });
    },
  },
};
