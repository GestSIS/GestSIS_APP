import types from '../mutationTypes';
import MedecinService from '../../services/MedecinService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.UPDATE_MEDECIN_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_MEDECIN](state, medecin) {
      state.liste = [...state.liste, medecin];
    },
    [types.UPDATE_MEDECIN](state, medecin) {
      state.liste = [
        ...state.liste.map((m) => (m.id === medecin.id ? medecin : m)),
      ];
    },
    [types.REMOVE_MEDECIN](state, medecinId) {
      state.liste = state.liste.filter((m) => m.id != medecinId);
    },
  },
  getters: {
    getMedecin: (state) => (id) => state.liste.find((m) => m.id === id),
  },
  actions: {
    fetchMedecins({ commit }) {
      return MedecinService.getMedecins().then((data) =>
        commit(types.UPDATE_MEDECIN_LISTE, data)
      );
    },
    addMedecin({ commit }, medecin) {
      return MedecinService.addMedecin(medecin).then((data) => {
        commit(types.ADD_MEDECIN, data);
        return data;
      });
    },
    updateMedecin({ commit }, medecin) {
      return MedecinService.updateMedecin(medecin).then((data) => {
        commit(types.UPDATE_MEDECIN, data);
        return data;
      });
    },
    removeMedecin({ commit }, medecin) {
      return MedecinService.removeMedecin(medecin).then((data) => {
        commit(types.REMOVE_MEDECIN, data);
        return data;
      });
    },
  },
};
