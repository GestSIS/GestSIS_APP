import types from '../mutationTypes';
import ControlesMedicauxTypeService from '../../services/ControlesMedicauxTypeService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_CONTROLE_MEDICAUX_TYPES_LISTE](state, payload) {
      state.liste = payload;
    }
  },
  actions: {
    fetchControlesMedicauxTypes({ commit }) {
      return ControlesMedicauxTypeService.getTypes().then(data =>
        commit(types.UPDATE_CONTROLE_MEDICAUX_TYPES_LISTE, data)
      );
    }
  },
  getters: {
    getControleMedicalType: state => id => state.liste.filter(s => s.id === id)[0],
  }
};
