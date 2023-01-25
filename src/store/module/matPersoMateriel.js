import types from '../mutationTypes';
import MatPersoMaterielService from '../../services/MatPersoMaterielService.js';

export default {
  state: {
    aRecuperer: [],
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.aRecuperer = [];
      state.liste = [];
    },
    [types.UPDATE_MAT_PERSO_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.REMOVE_MAT_PERSO](state, ids) {
      const setIds = new Set(ids);
      state.liste = [...state.liste.filter((m) => !setIds.has(m.id))];
    },
    [types.UPDATE_MAT_PERSO_A_RECUPERER_LISTE](state, payload) {
      state.aRecuperer = payload;
    },
  },
  actions: {
    fetchMatPerso({ commit }) {
      return MatPersoMaterielService.getMateriel().then((data) =>
        commit(types.UPDATE_MAT_PERSO_LISTE, data)
      );
    },
    fetchMatPersoARecuperer({ commit }) {
      return MatPersoMaterielService.getARecuperer().then((data) =>
        commit(types.UPDATE_MAT_PERSO_A_RECUPERER_LISTE, data)
      );
    },
    attribuerMatPerso({ commit }, attributions) {
      return MatPersoMaterielService.attribuer(attributions).then((data) =>
        commit(types.UPDATE_MAT_PERSO_LISTE, data)
      );
    },
    retourMatPerso({ commit }, retours) {
      return MatPersoMaterielService.retour(retours).then((data) =>
        commit(types.UPDATE_MAT_PERSO_LISTE, data)
      );
    },
    addMatPerso({ commit }, materiels) {
      return MatPersoMaterielService.create(materiels).then((data) =>
        commit(types.UPDATE_MAT_PERSO_LISTE, data)
      );
    },
    updateMatPerso({ commit }, materiels) {
      return MatPersoMaterielService.update(materiels).then((data) =>
        commit(types.UPDATE_MAT_PERSO_LISTE, data)
      );
    },
    removeMatPerso({ commit }, materielsIds) {
      return MatPersoMaterielService.remove(materielsIds).then((data) =>
        commit(types.REMOVE_MAT_PERSO, materielsIds)
      );
    },
  },
};
