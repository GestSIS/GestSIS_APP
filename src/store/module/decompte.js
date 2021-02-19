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
    [types.ADD_DECOMPTE](state, payload) {
      state.liste = [...state.liste, payload];
    },
  },
  actions: {
    fetchDecomptes({ getters, commit }) {
      return DecompteService.getDecomptes(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_DECOMPTES, data));
    },
    genererDecompteAnnuel({ commit }, params) {
      return DecompteService.genererDecompteAnnuel(params).then((data) =>
        commit(types.ADD_DECOMPTE, data)
      );
    },
    genererDecompteSapeur({ commit }, params) {
      return DecompteService.genererDecompteSapeur(params).then((data) =>
        commit(types.ADD_DECOMPTE, data)
      );
    },
    genererDecompteExercice({ commit }, params) {
      return DecompteService.genererDecompteExercice(params).then((data) =>
        commit(types.ADD_DECOMPTE, data)
      );
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
