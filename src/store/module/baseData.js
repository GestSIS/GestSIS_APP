import types from '../mutationTypes';
import BaseDataService from '../../services/BaseDataService.js';

export default {
  state: {
    permisTypes: [],
    civilites: [],
    telephoneTypes: [],
  },
  mutations: {
    [types.UPDATE_PERMIS_LISTE](state, payload) {
      state.permisTypes = payload;
    },
    [types.UPDATE_CIVILITE_LISTE](state, payload) {
      state.civilites = payload;
    },
    [types.UPDATE_TELEPHONE_TYPE_LISTE](state, payload) {
      state.telephoneTypes = payload;
    },
  },
  getters: {
    listTelephoneTypes: (state) => state.telephoneTypes,
  },
  actions: {
    fetchPermisType({ commit, state }) {
      if (state.permisTypes.length) {
        return Promise.resolve();
      }
      return BaseDataService.getPermisType().then((data) =>
        commit(types.UPDATE_PERMIS_LISTE, data)
      );
    },
    fetchCivilites({ commit, state }) {
      if (state.civilites.length) {
        return Promise.resolve();
      }
      return BaseDataService.getCivilites().then((data) =>
        commit(types.UPDATE_CIVILITE_LISTE, data)
      );
    },
    fetchTelephoneTypes({ commit, state }) {
      if (state.telephoneTypes.length) {
        return Promise.resolve();
      }
      return BaseDataService.getTelephones().then((data) =>
        commit(types.UPDATE_TELEPHONE_TYPE_LISTE, data)
      );
    },
  },
};
