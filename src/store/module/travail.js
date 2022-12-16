import types from '../mutationTypes';
import Travail from '../../services/TravailService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_TRAVAIL_LISTE](state, payload) {
      state.liste = payload.sort((t1, t2) => t1.date > t2.date);
    },
    [types.ADD_TRAVAIL](state, type) {
      state.liste = [...state.liste, type];
    },
    [types.UPDATE_TRAVAIL](state, type) {
      state.liste = [...state.liste.map((m) => (m.id === type.id ? type : m))];
    },
    [types.REMOVE_TRAVAIL](state, typeId) {
      state.liste = state.liste.filter((m) => m.id != typeId);
    },
  },
  actions: {
    fetchTravaux({ commit, getters }) {
      return Travail.getTravaux(getters.activeExerciceComptableId).then(
        (data) => commit(types.UPDATE_TRAVAIL_LISTE, data)
      );
    },
    addTravaux({ commit }, travaux) {
      return Travail.addTravaux(travaux).then((data) => {
        data.foreach((travail) => commit(types.ADD_TRAVAIL, travail));
        return data;
      });
    },
    updateTravail({ commit }, type) {
      return Travail.updateTravail(type).then((data) => {
        commit(types.UPDATE_TRAVAIL, data);
        return data;
      });
    },
    reviewTravail({ commit }, type) {
      return Travail.reviewTravail(type).then((data) => {
        commit(types.UPDATE_TRAVAIL, data);
        return data;
      });
    },
    removeTravail({ commit }, typeId) {
      return Travail.removeTravail(typeId).then((data) => {
        commit(types.REMOVE_TRAVAIL, typeId);
        return data;
      });
    },
  },
};
