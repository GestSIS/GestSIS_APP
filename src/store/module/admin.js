import types from '../mutationTypes';
import AdminService from '../../services/AdminService.js';

export default {
  state: {
    sis: [],
    users: [],
    contacts: {},
<<<<<<< HEAD
    params: {},
=======
>>>>>>> 076e2c9 (Start new UI)
  },
  mutations: {
    [types.ADMIN_SIS_CONTACTS](state, payload) {
      state.contacts = payload;
    },
    [types.ADMIN_SIS_PARAMS](state, payload) {
      state.params = payload;
    },
    [types.ADMIN_USER_LISTE](state, payload) {
      state.users = payload;
    },
    [types.ADMIN_EDIT_USER](state, user) {
      state.users = state.users.map((u) => (u.id == user.id ? user : u));
    },
    [types.ADMIN_REMOVE_USER](state, userId) {
      state.users = state.users.filter((u) => u.id != userId);
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
    loadAllSisContacts({ commit }) {
      return AdminService.getAllSisContacts().then((data) =>
        commit(types.ADMIN_SIS_CONTACTS, data)
      );
    },
    loadAllSisParams({ commit }) {
      return AdminService.getAllSisParams().then((data) =>
        commit(types.ADMIN_SIS_PARAMS, data)
      );
    },
    editUser({ commit }, user) {
      return AdminService.editUser(user).then(() =>
        commit(types.ADMIN_EDIT_USER, user)
      );
    },
    deleteUser({ commit }, userId) {
      return AdminService.deleteUser(userId).then(() =>
        commit(types.ADMIN_REMOVE_USER, userId)
      );
    },
  },
};
