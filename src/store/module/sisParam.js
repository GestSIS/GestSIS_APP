import types from '../mutationTypes';
import SisParamService from '../../services/SisParamService.js';

export default {
  state: {
    params: null,
    contacts: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.params = null;
      state.contacts = null;
    },
    [types.UPDATE_SIS_PARAMS](state, payload) {
      state.params = payload;
    },
    [types.UPADTE_SIS_CONTACT_LISTE](state, payload) {
      state.contacts = payload;
    },
    [types.CREATE_SIS_CONTACT](state, payload) {
      state.contacts = [...state.contacts, payload];
    },
    [types.REMOVE_SIS_CONTACT](state, id) {
      state.contacts = state.contacts.filter((c) => c.id != id);
    },
  },
  actions: {
    fetchSisParams({ state, commit }) {
      if (state.params === null) {
        return SisParamService.getParams().then((data) =>
          commit(types.UPDATE_SIS_PARAMS, data)
        );
      }
    },
    updateSisParams({ commit }, params) {
      return SisParamService.updateParams(params).then((data) => {
        commit(types.UPDATE_SIS_PARAMS, data);
        return data;
      });
    },
    fetchSisContacts({ commit }) {
      return SisParamService.getContacts().then((data) =>
        commit(types.UPADTE_SIS_CONTACT_LISTE, data)
      );
    },
    addSisContact({ commit }, contact) {
      return SisParamService.addContact(contact).then((data) => {
        commit(types.CREATE_SIS_CONTACT, data);
        return data;
      });
    },
    removeSisContact({ commit }, contactId) {
      return SisParamService.removeContact(contactId).then(() => {
        commit(types.REMOVE_SIS_CONTACT, contactId);
      });
    },
  },
};
