import types from '../mutationTypes';
import BaseDataService from '../../services/BaseDataService';

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
    listPermisType: (state) => state.permisTypes,
    listTelephoneTypes: (state) => state.telephoneTypes,
    getTelephone: (state) => (id) =>
      state.telephoneTypes.filter((t) => t.id === id)[0],
  },
  actions: {
    fetchPermisType({ commit }) {
      return BaseDataService.getPermisType().then((data) =>
        commit(types.UPDATE_PERMIS_LISTE, data)
      );
    },
    fetchCivilites({ commit }) {
      return BaseDataService.getCivilites().then((data) =>
        commit(types.UPDATE_CIVILITE_LISTE, data)
      );
    },
    fetchTelephoneTypes({ commit }) {
      return BaseDataService.getTelephones().then((data) =>
        commit(types.UPDATE_TELEPHONE_TYPE_LISTE, data)
      );
    },
  },
};
