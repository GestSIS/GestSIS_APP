import types from '../mutationTypes';
import MedecinService from '../../services/MedecinService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_MEDECIN_LISTE](state, payload) {
      state.liste = payload;
    }
  },
  actions: {
    fetchMedecins({ commit }) {
      return MedecinService.getMedecins().then(data =>
        commit(types.UPDATE_MEDECIN_LISTE, data)
      );
    }
  },
  getters: {
    getMedecin: state => id => state.liste.filter(s => s.id === id)[0],
  }
};
