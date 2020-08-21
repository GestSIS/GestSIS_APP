import types from '../mutationTypes';
import MaterielService from '../../services/MaterielService';

export default {
  state: {
    liste: [],
    active: {
      id: null,
      materiel_id: null,
      quantite: 0
    }
  },
  mutations: {
    [types.UPDATE_MATERIEL_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_CURRENT_MATERIEL](state, payload) {
      state.active = payload;
    }
  },
  getters: {
    getMateriel: state => materiel_id =>
      state.liste.filter(m => m.id === materiel_id)[0]
  },
  actions: {
    fetchMateriels({ commit }) {
      return MaterielService.getMateriels().then(data =>
        commit(types.UPDATE_MATERIEL_LISTE, data)
      );
    },
    updateActiveMateriel({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_MATERIEL, payload);
    },
    resetActiveMateriel({ commit }) {
      return commit(types.UPDATE_CURRENT_MATERIEL, {
        id: null,
        materiel_id: null,
        quantite: 0
      });
    }
  }
};
