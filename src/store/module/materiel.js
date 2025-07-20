import types from '../mutationTypes';
import MaterielService from '../../services/MaterielService.js';

export default {
  state: {
    liste: [],
    active: {
      id: null,
      materiel_id: null,
      quantite: 0,
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
      state.active = {
        id: null,
        materiel_id: null,
        quantite: 0,
      };
    },
    [types.UPDATE_MATERIEL_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_MATERIEL](state, materiel) {
      state.liste = [...state.liste, materiel];
    },
    [types.UPDATE_MATERIEL](state, materiel) {
      state.liste = [
        ...state.liste.map((m) => (m.id === materiel.id ? materiel : m)),
      ];
    },
    [types.REMOVE_MATERIEL](state, materielId) {
      state.liste = state.liste.filter((m) => m.id != materielId);
    },
  },
  actions: {
    fetchMateriels({ commit }) {
      return MaterielService.getMateriels().then((data) =>
        commit(types.UPDATE_MATERIEL_LISTE, data)
      );
    },
    addMateriel({ commit }, materiel) {
      return MaterielService.addMateriel(materiel).then((data) => {
        commit(types.ADD_MATERIEL, data);
        return data;
      });
    },
    updateMateriel({ commit }, materiel) {
      return MaterielService.updateMateriel(materiel).then((data) => {
        commit(types.UPDATE_MATERIEL, data);
        return data;
      });
    },
    removeMateriel({ commit }, materielId) {
      return MaterielService.removeMateriel(materielId).then((data) => {
        commit(types.REMOVE_MATERIEL, materielId);
        return data;
      });
    },
  }
};
