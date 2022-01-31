import types from '../mutationTypes';
import ExerciceHeureService from '../../services/ExerciceHeureTypeService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_HEURE_EXERCICE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((c1, c2) => c1.designation > c2.designation);
    },
    [types.ADD_HEURE_EXERCICE](state, heure) {
      state.liste = [...state.liste, heure];
    },
    [types.UPDATE_HEURE_EXERCICE](state, heure) {
      state.liste = [
        ...state.liste.map((m) => (m.id === heure.id ? heure : m)),
      ];
    },
    [types.REMOVE_HEURE_EXERCICE](state, heureId) {
      state.liste = state.liste.filter((m) => m.id != heureId);
    },
  },
  actions: {
    fetchHeuresExercice({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return ExerciceHeureService.getHeuresTypes().then((data) =>
          commit(types.UPDATE_HEURE_EXERCICE_LISTE, data)
        );
      }
    },
    addExerciceHeure({ commit }, heure) {
      return ExerciceHeureService.addHeureType(heure).then((data) => {
        commit(types.ADD_HEURE_EXERCICE, data);
        return data;
      });
    },
    updateExerciceHeure({ commit }, heure) {
      return ExerciceHeureService.updateHeureType(heure).then((data) => {
        commit(types.UPDATE_HEURE_EXERCICE, data);
        return data;
      });
    },
    removeExerciceHeure({ commit }, heureId) {
      return ExerciceHeureService.removeHeureType(heureId).then((data) => {
        commit(types.REMOVE_HEURE_EXERCICE, heureId);
        return data;
      });
    },
  },
};
