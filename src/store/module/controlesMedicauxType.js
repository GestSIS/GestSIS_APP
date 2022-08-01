import types from '../mutationTypes';
import ControlesMedicauxTypeService from '../../services/ControlesMedicauxTypeService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_CONTROLE_MEDICAUX_TYPES_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_CONTROLE_MEDICAUX_TYPES](state, type) {
      state.liste = [...state.liste, type];
    },
    [types.UPDATE_CONTROLE_MEDICAUX_TYPES](state, type) {
      state.liste = [...state.liste.map((m) => (m.id === type.id ? type : m))];
    },
    [types.REMOVE_CONTROLE_MEDICAUX_TYPES](state, typeId) {
      state.liste = state.liste.filter((m) => m.id != typeId);
    },
  },
  actions: {
    fetchControlesMedicauxTypes({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      }
      return ControlesMedicauxTypeService.getTypes().then((data) =>
        commit(types.UPDATE_CONTROLE_MEDICAUX_TYPES_LISTE, data)
      );
    },
    addControlesMedicauxTypes({ commit }, type) {
      return ControlesMedicauxTypeService.addType(type).then((data) => {
        commit(types.ADD_CONTROLE_MEDICAUX_TYPES, data);
        return data;
      });
    },
    updateControlesMedicauxTypes({ commit }, type) {
      return ControlesMedicauxTypeService.updateType(type).then((data) => {
        commit(types.UPDATE_CONTROLE_MEDICAUX_TYPES, data);
        return data;
      });
    },
    removeControlesMedicauxTypes({ commit }, typeId) {
      return ControlesMedicauxTypeService.removeType(typeId).then((data) => {
        commit(types.REMOVE_CONTROLE_MEDICAUX_TYPES, typeId);
        return data;
      });
    },
  },
};
