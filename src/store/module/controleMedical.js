import types from '../mutationTypes';
import ControlesMedicauxService from '../../services/ControlesMedicauxService';

export default {
  state: {
    liste: [],
    active: {
      id: null,
      data: {}
    }
  },
  mutations: {
    [types.UPDATE_CONTROLE_MEDICAUX_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_CURRENT_CONTROLE_MEDICAL](state, payload) {
      state.active.id = payload.id;
      state.active.data = payload;
    },
    [types.RESET_CURRENT_CONTROLE_MEDICAL](state) {
      state.active.id = null;
      state.active.data = {
        designation: '',
        validite: '',
        sapeur_id: '',
        medecin_id: '',
        consultation: '',
        validite: '',
        accepter: 0
      };
    }
  },
  actions: {
    fetchControlesMedicaux({ commit }) {
      return ControlesMedicauxService.getControlesMedicaux().then(data =>
        commit(types.UPDATE_CONTROLE_MEDICAUX_LISTE, data)
      );
    },
    fetchControleMedical({ commit }, payload) {
      return ControlesMedicauxService.getControleMedical(payload).then(data => 
        commit(types.UPDATE_CURRENT_CONTROLE_MEDICAL, data)
      );
    },
    resetControleMedical({ commit }) {
      return commit(types.RESET_CURRENT_CONTROLE_MEDICAL)
    },

    createControleMedical({ commit, state }, payload) {
      return ControlesMedicauxService.createControleMedical(
        payload || state.active.data
      ).then(
        data => {
          commit(types.UPDATE_CURRENT_CONTROLE_MEDICAL, data);
          return data;
        }
      );
    },

    updateControleMedical({ commit, state }, payload) {
      return ControlesMedicauxService.updateControleMedical(
        state.active.data.id,
        payload || state.active.data
      ).then(
        data => {
          commit(types.UPDATE_CURRENT_CONTROLE_MEDICAL, data);
          return data;
        }
      )
    },

    addJustificatif({ state, commit }, justificatif) {
      return ControlesMedicauxService.addJustificatif(state.active.id, justificatif).then(
        data => {
          commit(types.ADD_CURRENT_SAPEUR_TELEPHONE, data);
          return data;
        }
      );
    },

    removeJustificatif({ state, commit }, justificatifId) {
      return ControlesMedicauxService.removeJustificatif(state.active.id, telephoneId).then(
        data =>
          commit(types.REMOVE_CURRENT_SAPEUR_TELEPHONE, telephoneId).then(
            () => data
          )
      );
    },
  }
};
