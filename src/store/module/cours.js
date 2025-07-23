import types from '../mutationTypes';
import CoursService from '../../services/CoursService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_COURS_LISTE](state, payload) {
      state.liste = payload.sort((c1, c2) => c2.tri - c1.tri);
    },
    [types.ADD_COURS](state, cours) {
      state.liste = [...state.liste, cours].sort((c1, c2) => c2.tri - c1.tri);
    },
    [types.UPDATE_COURS](state, cours) {
      state.liste = [
        ...state.liste.map((m) => (m.id === cours.id ? cours : m)),
      ].sort((c1, c2) => c2.tri - c1.tri);
    },
    [types.REMOVE_COURS](state, coursId) {
      state.liste = state.liste.filter((m) => m.id != coursId);
    },
  },
  actions: {
    fetchCours({ commit }) {
      return CoursService.getCours().then((data) =>
        commit(types.UPDATE_COURS_LISTE, data)
      );
    },
    addCours({ commit }, cours) {
      return CoursService.addCours(cours).then((data) => {
        commit(types.ADD_COURS, data);
        return data;
      });
    },
    updateCours({ commit }, cours) {
      return CoursService.updateCours(cours).then((data) => {
        commit(types.UPDATE_COURS, data);
        return data;
      });
    },
    removeCours({ commit }, coursId) {
      return CoursService.removeCours(coursId).then((data) => {
        commit(types.REMOVE_COURS, coursId);
        return data;
      });
    },
  },
};
