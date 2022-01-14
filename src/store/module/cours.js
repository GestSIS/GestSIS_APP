import types from '../mutationTypes';
import CoursService from '../../services/CoursService';

export default {
  state: {
    liste: [],
    active: {
      id: 0,
      cours_id: 0,
      fonction_id: 0,
      fonction_sapeur_id: 0,
      grade_id: 0,
      localite_id: 0,
      precedent_id: 0,
      date: null,
      date_fonction: null,
      date_grade: null,
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
      state.active = {
        id: 0,
        cours_id: 0,
        fonction_id: 0,
        fonction_sapeur_id: 0,
        grade_id: 0,
        localite_id: 0,
        precedent_id: 0,
        date: null,
        date_fonction: null,
        date_grade: null,
      };
    },
    [types.UPDATE_COURS_LISTE](state, payload) {
      state.liste = payload.sort((c1,c2) => c2.tri - c1.tri);
    },
    [types.UPDATE_CURRENT_COURS](state, payload) {
      state.active = payload;
    },
    [types.ADD_COURS](state, cours) {
      state.liste = [...state.liste, cours].sort((c1,c2) => c2.tri - c1.tri);
    },
    [types.UPDATE_COURS](state, cours) {
      state.liste = [
        ...state.liste.map((m) => (m.id === cours.id ? cours : m)),
      ].sort((c1,c2) => c2.tri - c1.tri);
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
    updateActiveCours({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_COURS, payload);
    },
    resetActiveCours({ commit }) {
      return commit(types.UPDATE_CURRENT_COURS, {
        id: 0,
        cours_id: 0,
        fonction_id: 0,
        fonction_sapeur_id: 0,
        grade_id: 0,
        localite_id: 0,
        precedent_id: 0,
        date: null,
        date_fonction: null,
        date_grade: null,
      });
    },
  },
};
