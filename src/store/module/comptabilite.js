import types from '../mutationTypes';
import ComptabiliteService from '../../services/ComptabiliteService';

export default {
  state: {
    comptes: [],
    indemnites: {
      exercices: [],
      interventions: [],
      annuels: []
    },
    listeFraisAnnuels: [],
    listeIndemnitesAnnuels: [],
    frais: {
      annuels: []
    },
    ecritures: {
      annuels: []
    },
    active: {
      compteId: null,
      ecritures: []
    }
  },
  mutations: {
    [types.UPDATE_INDEMNITES_TYPES](state, payload) {
      state.indemnites = {
        ...state.indemnites,
        ...payload
      };
    },
    [types.UPDATE_FRAIS_TYPES](state, payload) {
      state.frais = {
        ...state.frais,
        ...payload
      };
    },
    [types.UPDATE_ECRITURES_ANNUELS_LISTEE](state, payload) {
      state.ecritures.annuels = [...payload];
    },
    [types.UPDATE_COMPTES_LISTEE](state, payload) {
      state.comptes = payload;
    },
    [types.UPDATE_CURRENT_COMPTE_ECRITURES](state, payload) {
      state.active.ecritures = payload;
    },
    [types.SELECT_CURRENT_COMPTE](state, payload) {
      state.active.compteId = payload;
    }
  },
  getters: {
    getCompte: state => id => state.comptes.filter(c => c.id === id)[0]
  },
  actions: {
    fetchComptes({ commit }) {
      return ComptabiliteService.getComptes().then(data =>
        commit(types.UPDATE_COMPTES_LISTEE, data)
      );
    },
    selectActiveCompte({ commit, dispatch }, payload) {
      commit(types.SELECT_CURRENT_COMPTE, payload);
      return dispatch('fetchEcritureComptes');
    },
    fetchEcritureComptes({ state, getters, commit }) {
      return ComptabiliteService.getEcritureForCompte(
        state.active.compteId,
        getters.currentExerciceComptableId
      ).then(data => {
        return commit(types.UPDATE_CURRENT_COMPTE_ECRITURES, data);
      });
    },
    fetchIndemnitesTypes({ commit }) {
      return ComptabiliteService.getIndemniteTypes().then(data =>
        commit(types.UPDATE_INDEMNITES_TYPES, data)
      );
    },
    fetchFraisTypes({ commit }) {
      return ComptabiliteService.getFraisTypes().then(data =>
        commit(types.UPDATE_FRAIS_TYPES, data)
      );
    },
    fetchEcrituresAnnuels({ commit, getters }) {
      return ComptabiliteService.getEcrituresAnnuelsForExerciceComptable(
        getters.currentExerciceComptableId
      ).then(data => commit(types.UPDATE_ECRITURES_ANNUELS_LISTEE, data));
    },
    imputerExercice({ commit }, payload) {
      return ComptabiliteService.imputerExercice(
        payload.exercice_id,
        payload
      ).then(data => {
        commit(types.UPDATE_EXERCICE_STATUT, {
          id: payload.exercice_id,
          statut: data.statut
        });
        return data;
      });
    },
    imputerIntervention({ commit }, payload) {
      return ComptabiliteService.imputerIntervention(
        payload.intervention_id,
        payload
      ).then(data => {
        commit(types.UPDATE_INTERVENTION_STATUT, {
          id: payload.intervention_id,
          statut: data.statut
        });
        return data;
      });
    },
    imputerAnnuel({ commit, getters }) {
      return ComptabiliteService.imputerAnnuel(
        getters.currentExerciceComptableId
      ).then(data => {
        commit(types.UPDATE_ECRITURES_ANNUELS_LISTEE, [
          ...data.indemnites,
          ...data.frais
        ]);
        return data;
      });
    }
  }
};
