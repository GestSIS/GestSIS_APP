import types from '../mutationTypes';
import ControlesMedicauxService from '../../services/ControlesMedicauxService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_CONTROLE_MEDICAUX_LISTE](state, payload) {
      state.liste = payload;
    }
  },
  actions: {
    fetchControlesMedicaux({ commit }) {
      return ControlesMedicauxService.getControlesMedicaux().then(data =>
        commit(types.UPDATE_CONTROLE_MEDICAUX_LISTE, data)
      );
    }
  }
};
