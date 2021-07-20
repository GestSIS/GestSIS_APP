import types from '../mutationTypes';
import TelephoneService from '../../services/TelephoneService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_TELEPHONE_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_TELEPHONE](state, telephone) {
      state.liste = [...state.liste, telephone];
    },
    [types.UPDATE_TELEPHONE](state, telephone) {
      state.liste = [
        ...state.liste.map((m) => (m.id === telephone.id ? telephone : m)),
      ];
    },
    [types.REMOVE_TELEPHONE](state, telephoneId) {
      state.liste = state.liste.filter((m) => m.id != telephoneId);
    },
  },
  actions: {
    fetchTelephones({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return TelephoneService.getTelephones().then((data) =>
          commit(types.UPDATE_TELEPHONE_LISTE, data)
        );
      }
    },
    addTelephone({ commit }, telephone) {
      return TelephoneService.addTelephone(telephone).then((data) => {
        commit(types.ADD_TELEPHONE, data);
        return data;
      });
    },
    updateTelephone({ commit }, telephone) {
      return TelephoneService.updateTelephone(telephone).then((data) => {
        commit(types.UPDATE_TELEPHONE, data);
        return data;
      });
    },
    removeTelephone({ commit }, telephone) {
      return TelephoneService.removeTelephone(telephone).then((data) => {
        commit(types.REMOVE_TELEPHONE, data);
        return data;
      });
    },
  },
};
