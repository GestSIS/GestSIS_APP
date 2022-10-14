import types from '../mutationTypes';
import MatPersoTypeService from '../../services/MatPersoTypeService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_MAT_PERSO_TYPE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
    [types.ADD_MAT_PERSO_TYPE](state, type) {
      state.liste = [...state.liste, type];
    },
    [types.UPDATE_MAT_PERSO_TYPE](state, type) {
      state.liste = [...state.liste.map((m) => (m.id === type.id ? type : m))];
    },
    [types.REMOVE_MAT_PERSO_TYPE](state, typeId) {
      state.liste = state.liste.filter((m) => m.id != typeId);
    },
  },
  actions: {
    fetchMatPersoTypes({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return MatPersoTypeService.getTypes().then((data) =>
          commit(types.UPDATE_MAT_PERSO_TYPE_LISTE, data)
        );
      }
    },
    addMatPersoType({ commit }, type) {
      return MatPersoTypeService.addType(type).then((data) => {
        commit(types.ADD_MAT_PERSO_TYPE, data);
        return data;
      });
    },
    updateMatPersoType({ commit }, type) {
      return MatPersoTypeService.updateType(type).then((data) => {
        commit(types.UPDATE_MAT_PERSO_TYPE, data);
        return data;
      });
    },
    removeMatPersoType({ commit }, typeId) {
      return MatPersoTypeService.remove(typeId).then((data) => {
        commit(types.REMOVE_MAT_PERSO_TYPE, typeId);
        return data;
      });
    },
  },
};
