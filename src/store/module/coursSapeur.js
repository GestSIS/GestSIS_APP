import types from '../mutationTypes';
import CoursSapeurService from '../../services/CoursSapeurService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_COURS_SAPEUR_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_COURS_SAPEUR_ECRITURE_STATUT](state, payload) {
      state.liste = state.liste.map((c) =>
        c.id == payload.id ? { ...c, ecritures: payload.ecritures } : c
      );
    },
  },
  actions: {
    fetchCoursSapeurs({ commit, getters }) {
      return CoursSapeurService.getCoursSapeurs(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_COURS_SAPEUR_LISTE, data));
    },
  },
};
