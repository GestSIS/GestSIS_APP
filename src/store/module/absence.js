import types from '../mutationTypes';
import AbsenceService from '../../services/AbsenceService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_ABSENCE_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_ABSENCE](state, absence) {
      state.liste = [...state.liste, absence];
    },
    [types.UPDATE_ABSENCE](state, absence) {
      state.liste = [
        ...state.liste.map((m) => (m.id === absence.id ? absence : m)),
      ];
    },
    [types.REMOVE_ABSENCE](state, absenceId) {
      state.liste = state.liste.filter((m) => m.id != absenceId);
    },
  },
  actions: {
    fetchAbsences({ commit }, exerciceComptableId) {
      return AbsenceService.getAbsences(exerciceComptableId).then((data) =>
        commit(types.UPDATE_ABSENCE_LISTE, data)
      );
    },
    addAbsence({ commit }, absence) {
      return AbsenceService.addAbsence(absence).then((data) => {
        commit(types.ADD_ABSENCE, data);
        return data;
      });
    },
    updateAbsence({ commit }, absence) {
      return AbsenceService.updateAbsence(absence).then((data) => {
        commit(types.UPDATE_ABSENCE, data);
        return data;
      });
    },
    removeAbsence({ commit }, absenceId) {
      return AbsenceService.removeAbsence(absenceId).then((data) => {
        commit(types.REMOVE_ABSENCE, absenceId);
        return data;
      });
    },
  },
};
