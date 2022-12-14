import types from '../mutationTypes';
import CompteService from '../../services/CompteService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_COMPTE_LISTE](state, payload) {
      state.liste = payload.map((c) => ({
        ...c,
        label: `${c.numero} ${c.designation}`,
      }));
    },
    [types.ADD_COMPTE](state, compte) {
      state.liste = [
        ...state.liste,
        {
          ...compte,
          label: `${compte.numero} ${compte.designation}`,
        },
      ];
    },
    [types.UPDATE_COMPTE](state, compte) {
      state.liste = [
        ...state.liste.map((m) =>
          m.id === compte.id
            ? {
                ...compte,
                label: `${compte.numero} ${compte.designation}`,
              }
            : m
        ),
      ];
    },
    [types.REMOVE_COMPTE](state, compteId) {
      state.liste = state.liste.filter((m) => m.id != compteId);
    },
  },
  actions: {
    fetchComptes({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return CompteService.getComptes().then((data) =>
          commit(types.UPDATE_COMPTE_LISTE, data)
        );
      }
    },
    addCompte({ commit }, compte) {
      return CompteService.addCompte(compte).then((data) => {
        commit(types.ADD_COMPTE, data);
        return data;
      });
    },
    updateCompte({ commit }, compte) {
      return CompteService.updateCompte(compte).then((data) => {
        commit(types.UPDATE_COMPTE, data);
        return data;
      });
    },
    removeCompte({ commit }, compteId) {
      return CompteService.removeCompte(compteId).then((data) => {
        commit(types.REMOVE_COMPTE, compteId);
        return data;
      });
    },
  },
};
