import types from '../mutationTypes';
import FonctionService from '../../services/FonctionService';

export default {
  state: {
    liste: [],
    currentFonction: {
      id: 0,
      fonction_id: 0,
      debut: null,
      fin: null,
      remarque: '',
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
      state.currentFonction = {
        id: 0,
        fonction_id: 0,
        debut: null,
        fin: null,
        remarque: '',
      };
    },
    [types.UPDATE_FONCTION_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_CURRENT_FONCTION](state, payload) {
      state.currentFonction = payload;
    },
    [types.ADD_FONCTION](state, fonction) {
      state.liste = [...state.liste, fonction];
    },
    [types.UPDATE_FONCTION](state, fonction) {
      state.liste = [
        ...state.liste.map((m) => (m.id === fonction.id ? fonction : m)),
      ];
    },
    [types.REMOVE_FONCTION](state, fonctionId) {
      state.liste = state.liste.filter((m) => m.id != fonctionId);
    },
  },
  getters: {
    getFonction: (state) => (fonction_id) => {
      return state.liste.find((f) => f.id === fonction_id);
    },
    activeFonction: (state) => {
      return state.currentFonction;
    },
  },
  actions: {
    fetchFonctions({ commit }) {
      return FonctionService.getFonctions().then((data) =>
        commit(types.UPDATE_FONCTION_LISTE, data)
      );
    },
    addFonction({ commit }, fonction) {
      return FonctionService.addFonction(fonction).then((data) => {
        commit(types.ADD_FONCTION, data);
        return data;
      });
    },
    updateFonction({ commit }, fonction) {
      return FonctionService.updateFonction(fonction).then((data) => {
        commit(types.UPDATE_FONCTION, data);
        return data;
      });
    },
    removeFonction({ commit }, fonction) {
      return FonctionService.removeFonction(fonction).then((data) => {
        commit(types.REMOVE_FONCTION, data);
        return data;
      });
    },
    updateActiveFonction({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_FONCTION, payload);
    },
    resetActiveFonction({ commit }) {
      return commit(types.UPDATE_CURRENT_FONCTION, {
        id: 0,
        fonction_id: 0,
        debut: null,
        fin: null,
        remarque: '',
      });
    },
  },
};
