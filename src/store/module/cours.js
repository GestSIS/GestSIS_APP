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
      date_grade: null
    }
  },
  mutations: {
    [types.UPDATE_COURS_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_CURRENT_COURS](state, payload) {
      state.active = payload;
    }
  },
  getters: {
    getCours: state => cours_id => state.liste.filter(c => c.id === cours_id)[0]
  },
  actions: {
    fetchCours({ commit }) {
      return CoursService.getCours().then(data =>
        commit(types.UPDATE_COURS_LISTE, data)
      );
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
        date_grade: null
      });
    }
  }
};
