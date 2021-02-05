import types from '../mutationTypes';
import SisParamService from '../../services/SisParamService';

export default {
  state: {
    params: null,
  },
  mutations: {
    [types.UPDATE_SIS_PARAMS](state, payload) {
      state.params = payload;
    },
  },
  actions: {
    fetchSisParams({ state, commit }) {
      if (state.params === null) {
        return SisParamService.getParams().then((data) =>
          commit(types.UPDATE_SIS_PARAMS, data)
        );
      } else {
        console.log('ts');
      }
    },
    updateSisParams({ commit }, params) {
      return SisParamService.updateParams(params).then((data) => {
        commit(types.UPDATE_SIS_PARAMS, data);
        return data;
      });
    },
  },
};
