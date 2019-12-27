import types from '../mutationTypes';
import FonctionService from '../../services/FonctionService';

export default {
  state: {
    liste: [],
    currentFonction: {
      id: 0,
      fonction_id: 0,
      debut: null,
      fin: null,
      remarque: ''
    }
  },
  mutations: {
    [types.UPDATE_FONCTION_LIST](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_CURRENT_FONCTION](state, payload) {
      state.currentFonction = payload;
    }
  },
  getters: {
    getFonction: state => fonction_id => {
      return state.liste.filter(f => f.id === fonction_id)[0];
    },
    activeFonction: state => {
      return state.currentFonction;
    }
  },
  actions: {
    fetchFonctions({ commit }) {
      return FonctionService.getFonctions().then(data =>
        commit(types.UPDATE_FONCTION_LIST, data)
      );
    },
    updateActiveFonction({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_FONCTION, payload);
    },
    resetActiveFonction({ commit }) {
      return commit(types.UPDATE_CURRENT_FONCTION, {
        id: 0,
        fonction_id: 0,
        debut: null,
        fin: null,
        remarque: ''
      });
    }
  }
};
