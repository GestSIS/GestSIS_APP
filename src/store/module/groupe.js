import types from '../mutationTypes';
import GroupeService from '../../services/GroupeService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
<<<<<<< HEAD
=======
      state.listeWithSapeurs = [];
>>>>>>> 14fe52e213d21035b15ba37d25fbe5f51445e80e
    },
    [types.UPDATE_GROUPE_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.CREATE_GROUPE](state, payload) {
      state.liste = [...liste, payload];
    },
    [types.UPDATE_GROUPE](state, groupe) {
      state.liste = [
        ...state.liste.map((g) => (g.id === groupe.id ? groupe : g)),
      ];
    },
    [types.DELETE_GROUPE](state, groupeId) {
      state.liste = state.liste.filter((g) => g.id != groupeId);
    },
    [types.UPDATE_GROUPE_SAPEURS](state, { groupeId, sapeurIds }) {
      state.liste = [
        ...state.liste.map((g) => (g.id === groupeId ? { ...g, sapeur_ids: sapeurIds } : g)),
      ];
    },
  },
  getters: {
    treeGroupesSapeurs: state => {
      let insideGroupes = groupeId =>
        state.liste
          .filter(i => i.pere_id === groupeId)
          .map(s => Object.assign({}, s))
          .map(s => ({
            ...s,
            sapeurs: s.sapeur_ids.map(s => s.sapeur_id),
            groupes: insideGroupes(s.id)
          }));

      return insideGroupes(null);
    },
    getGroupe: state => groupe_id =>
      state.liste.filter(g => g.id === groupe_id)[0]
  },
  actions: {
    fetchGroupes({ commit }) {
      return GroupeService.getGroupes().then(data =>
        commit(types.UPDATE_GROUPE_LISTE, data)
      );
    },
    createGroupe({ commit }, data) {
      return GroupeService.createGroupe(data).then(data =>
        commit(types.CREATE_GROUPE, data)
      );
    },
    updateGroupe({ commit }, { groupeId, data }) {
      return GroupeService.updateGroupe(groupeId, data).then(data =>
        commit(types.UPDATE_GROUPE, data)
      );
    },
    deleteGroupe({ commit }, groupeId) {
      return GroupeService.deleteGroupe(groupeId).then(data =>
        commit(types.DELETE_GROUPE, groupeId)
      );
    },
    updateGroupeSapeurs({ commit }, { groupeId, sapeurIds }) {
      return GroupeService.updateGroupeSapeurs(groupeId, sapeurIds).then((data) =>
        commit(types.UPDATE_GROUPE_SAPEURS, { groupeId, sapeurIds: data })
      );
    }
  }
};
