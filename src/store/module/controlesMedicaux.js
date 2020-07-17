import types from '../mutationTypes';
import VehiculeService from '../../services/ControlesMedicauxService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_CONTROLE_MEDICAUX_LIST](state, payload) {
      state.liste = payload;
    }
  },
  actions: {
    fetchControlesMedicaux({ commit }) {
      return VehiculeService.getVehicules().then(data =>
        commit(types.UPDATE_CONTROLE_MEDICAUX_LIST, data)
      );
    }
  }
};
