import types from '../mutationTypes';
import ExerciceService from '../../services/ExerciceService.js';

export default {
  state: {
    activeExerciceComptable: {
      id: 0,
      sms: [],
    },
    activeExercice: {
      id: 0,
      sms: [],
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_SMS_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((e1, e2) => new Date(e2.date) - new Date(e1.date));
    },
    [types.UPDATE_EXERCICE_ABSENCES](state, payload) {
      state.absences = payload;
    },
  },
  actions: {
    fetchListeSms({ getters, commit }) {
      return SmsService.getSms(getters.activeExerciceComptableId).then((data) =>
        commit(types.UPDATE_EXERCICE_LISTE, data)
      );
    },
  },
};
