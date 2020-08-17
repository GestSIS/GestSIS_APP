import types from '../mutationTypes';
import ControlesMedicauxService from '../../services/ControlesMedicauxService';

export default {
  state: {
    liste: [],
    active: {
      id: null,
      data: {},
    }
  },
  mutations: {
    [types.UPDATE_CONTROLE_MEDICAUX_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_CURRENT_CONTROLE_MEDICAL](state, payload) {
      state.active.id = payload.id;
      state.active.data = payload;
    },
    [types.RESET_CURRENT_CONTROLE_MEDICAL](state) {
      state.active.id = null;
      state.active.data = {};
    }
  },
  actions: {
    fetchControlesMedicaux({ commit }) {
      return ControlesMedicauxService.getControlesMedicaux().then(data =>
        commit(types.UPDATE_CONTROLE_MEDICAUX_LISTE, data)
      );
    },
    fetchControleMedical({ commit }, payload) {
      return ControlesMedicauxService.getControleMedical(payload).then(data => 
        commit(types.UPDATE_CURRENT_CONTROLE_MEDICAL, data)
      );
    },
    resetControleMedical({ commit }) {
      return commit(types.RESET_CURRENT_CONTROLE_MEDICAL)
    }
  }
};
