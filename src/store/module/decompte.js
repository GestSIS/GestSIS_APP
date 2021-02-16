import types from '../mutationTypes';
import DecompteService from '../../services/DecompteService';

export default {
  state: {
    liste: null,
  },
  mutations: {
    [types.UPDATE_DECOMPTES](state, payload) {
      state.liste = payload;
    },
  },
  actions: {
    fetchDecomptes({ getters, state, commit }) {
      return DecompteService.getDecomptes(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_DECOMPTES, data));
    },
    fetchPaiementsPourDecompte({ state, commit }, decompteId) {},
    //     updateAvsParams({ commit }, params) {
    //       return AvsParamService.updateParams(params).then((data) => {
    //         commit(types.UPDATE_AVS_PARAMS, data);
    //         return data;
    //       });
    //     },
  },
};
