import types from '../mutationTypes';
import AdminService from '../../services/AdminService.js';

export default {
  state: {
    sis: [],
    users: [],
  },
  mutations: {
    [types.AUTH_SIS_LISTE](state, payload) {
      state.sis = payload;
    },
    [types.EDIT_SIS](state, sis) {
      state.sis = [...state.sis.map((s) => (s.id == sis.id ? sis : s))];
    },
  },
  actions: {
    editSis({ commit }, sis) {
      return AdminService.editSis(sis).then((data) =>
        commit(types.EDIT_SIS, data.data)
      );
    },
  },
};
