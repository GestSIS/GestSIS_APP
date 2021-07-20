import types from '../mutationTypes';
import ExerciceComptableService from '../../services/ExerciceComptableService';

export default {
  state: {
    liste: [],
    activeId: null,
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
      state.activeId = null;
    },
    [types.UPDATE_EXERCICE_COMPTABLE_LISTE](state, payload) {
      state.liste = payload;
      if ((state.activeId || 0) === 0) {
        state.activeId = payload.sort((e1, e2) => e2.annee - e1.annee)[0].id;
      }
    },
    [types.SELECT_EXERCICE_COMPTABLE](state, payload) {
      state.activeId = payload;
    },
    [types.ADD_EXERCICE_COMPTABLE](state, exercice) {
      state.liste = [...state.liste, exercice];
    },
    [types.UPDATE_EXERCICE_COMPTABLE](state, exercice) {
      state.liste = [
        ...state.liste.map((m) => (m.id === exercice.id ? exercice : m)),
      ].sort((e1, e2) => e2.annee - e1.annee);
    },
    [types.REMOVE_EXERCICE_COMPTABLE](state, exerciceId) {
      state.liste = state.liste.filter((m) => m.id != exerciceId);
    },
  },
  getters: {
    currentExerciceComptableId: (state) => state.activeId,
    getExerciceComptable: (state) => (id) =>
      state.liste.filter((e) => e.id === id)[0],
    exerciceComptableDebut: (state) => (id) =>
      state.liste.filter((e) => e.id === id)[0].debut,
    exerciceComptableFin: (state) => (id) =>
      state.liste.filter((e) => e.id === id)[0].fin,
  },
  actions: {
    fetchExercicesComptables({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return ExerciceComptableService.getExercices().then((data) =>
          commit(types.UPDATE_EXERCICE_COMPTABLE_LISTE, data)
        );
      }
    },
    selectExerciceComptable({ commit }, excuse_type_id) {
      return commit(types.SELECT_EXERCICE_COMPTABLE, excuse_type_id);
    },
    addExerciceComptable({ commit }, exercice) {
      return ExerciceComptableService.addExercice(exercice).then((data) => {
        commit(types.ADD_EXERCICE_COMPTABLE, data);
        return data;
      });
    },
    updateExerciceComptable({ commit }, exercice) {
      return ExerciceComptableService.updateExercice(exercice).then((data) => {
        commit(types.UPDATE_EXERCICE_COMPTABLE, data);
        return data;
      });
    },
    removeExerciceComptable({ commit }, exercice) {
      return ExerciceComptableService.removeExercice(exercice).then((data) => {
        commit(types.REMOVE_EXERCICE_COMPTABLE, data);
        return data;
      });
    },
  },
};
