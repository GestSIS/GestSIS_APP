import types from '../mutationTypes';
import MesInfosService from '../../services/MesInfosService.js';

export default {
  state: {
    infos: {},
    exercices: [],
    paiements: [],
    ecritures: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.infos = {};
      state.exercices = {};
      state.paiements = {};
      state.ecritures = {};
    },
    [types.UPDATE_MES_INFOS](state, payload) {
      state.infos = payload;
    },
    [types.UPDATE_MES_EXERCICES](state, payload) {
      state.exercices = payload;
    },
    [types.UPDATE_MES_PAIEMENTS](state, payload) {
      state.paiements = payload;
    },
    [types.UPDATE_MES_ECRITURES](state, payload) {
      state.ecritures = payload;
    },
  },
  actions: {
    fetchMesInfos({ commit }) {
      return MesInfosService.getMesInfos().then((data) =>
        commit(types.UPDATE_MES_INFOS, data)
      );
    },
    fetchMesExercices({ commit }) {
      return MesInfosService.getMesExercices().then((data) =>
        commit(types.UPDATE_MES_EXERCICES, data)
      );
    },
    fetchMesDecomptes({ commit }) {
      return MesInfosService.getMesDecomptes().then((data) => {
        commit(types.UPDATE_MES_ECRITURES, data.ecritures);
        return commit(types.UPDATE_MES_PAIEMENTS, data.paiements);
      });
    },
  },
};
