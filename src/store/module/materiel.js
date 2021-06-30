import types from '../mutationTypes';
import MaterielService from '../../services/MaterielService';

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
    [types.UPDATE_MATERIEL_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_CURRENT_MATERIEL](state, payload) {
      state.active = payload;
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
  getters: {
    getMateriel: (state) => (materiel_id) =>
      state.liste.find((m) => m.id === materiel_id),
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
    removeMateriel({ commit }, materiel) {
      return MaterielService.removeMateriel(materiel).then((data) => {
        commit(types.REMOVE_MATERIEL, data);
        return data;
      });
    },
    updateActiveMateriel({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_MATERIEL, payload);
    },
    resetActiveMateriel({ commit }) {
      return commit(types.UPDATE_CURRENT_MATERIEL, {
        id: null,
        materiel_id: null,
        quantite: 0,
      });
    },
  },
};
