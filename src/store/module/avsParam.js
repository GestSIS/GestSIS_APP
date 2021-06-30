import types from '../mutationTypes';
import AvsParamService from '../../services/AvsParamService';

export default {
  state: {
    params: null,
  },
  mutations: {
    [types.UPDATE_AVS_PARAMS](state, payload) {
      state.params = payload;
    },
  },
  actions: {
    fetchAvsParams({ state, commit }) {
      if (state.params === null) {
        return AvsParamService.getParams().then((data) =>
          commit(types.UPDATE_AVS_PARAMS, data)
        );
      }
    },
    updateAvsParams({ commit }, params) {
      return AvsParamService.updateParams(params).then((data) => {
        commit(types.UPDATE_AVS_PARAMS, data);
        return data;
      });
    },
  },
};
