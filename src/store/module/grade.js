import types from '../mutationTypes';
import GradeService from '../../services/GradeService';

export default {
  state: {
    liste: [],
    active: {
      id: 0,
      grade_id: 0,
      date: null,
      remarque: '',
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
      state.active = {
        id: 0,
        grade_id: 0,
        date: null,
        remarque: '',
      };
    },
    [types.UPDATE_GRADE_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_CURRENT_GRADE](state, payload) {
      state.active = payload;
    },
    [types.ADD_GRADE](state, grade) {
      state.liste = [...state.liste, grade];
    },
    [types.UPDATE_GRADE](state, grade) {
      state.liste = [
        ...state.liste.map((m) => (m.id === grade.id ? grade : m)),
      ];
    },
    [types.REMOVE_GRADE](state, gradeId) {
      state.liste = state.liste.filter((m) => m.id != gradeId);
    },
  },
  actions: {
    fetchGrades({ commit }) {
      return GradeService.getGrades().then((data) =>
        commit(types.UPDATE_GRADE_LISTE, data)
      );
    },
    addGrade({ commit }, grade) {
      return GradeService.addGrade(grade).then((data) => {
        commit(types.ADD_GRADE, data);
        return data;
      });
    },
    updateGrade({ commit }, grade) {
      return GradeService.updateGrade(grade).then((data) => {
        commit(types.UPDATE_GRADE, data);
        return data;
      });
    },
    removeGrade({ commit }, grade) {
      return GradeService.removeGrade(grade).then((data) => {
        commit(types.REMOVE_GRADE, data);
        return data;
      });
    },
    updateActiveGrade({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_GRADE, payload);
    },
    resetActiveGrade({ commit }) {
      return commit(types.UPDATE_CURRENT_GRADE, {
        id: 0,
        grade_id: 0,
        date: null,
        remarque: '',
      });
    },
  },
};
