import types from '../mutationTypes';
import AdminService from '../../services/AdminService.js';

export default {
  state: {
    sis: [],
    users: [],
  },
  mutations: {
    [types.ADMIN_USER_LISTE](state, payload) {
      state.users = payload;
    },
    [types.AUTH_SIS_LISTE](state, payload) {
      state.sis = payload;
    },
    [types.ADD_SIS](state, sis) {
      state.sis = [...state.sis, sis];
    },
    [types.EDIT_SIS](state, sis) {
      state.sis = [...state.sis.map((s) => (s.id == sis.id ? sis : s))];
    },
  },
  actions: {
    addSis({ commit }, sis) {
      return AdminService.addSis(sis).then((data) =>
        commit(types.ADD_SIS, data.data)
      );
    },
    editSis({ commit }, sis) {
      return AdminService.editSis(sis).then((data) =>
        commit(types.EDIT_SIS, data.data)
      );
    },
    loadAllUsers({ commit }) {
      return AdminService.getAllUsers().then((data) =>
        commit(types.ADMIN_USER_LISTE, data.data)
      );
    },
  },
};
