import types from '../mutationTypes';
import ComptabiliteService from '../../services/ComptabiliteService';

export default {
  state: {
    indemnites: {
      exercices: [],
      interventions: [],
      annuels: [],
    },
    frais: {
      annuels: [],
    },
    amendes: [],
    listeFraisAnnuels: [],
    listeIndemnitesAnnuels: [],
    ecritures: {
      annuels: [],
    },
    active: {
      compteId: null,
      ecritures: [],
    },
  },
  mutations: {
    [types.UPDATE_INDEMNITES_TYPES](state, payload) {
      state.indemnites = {
        ...state.indemnites,
        ...payload,
      };
    },
    [types.UPDATE_FRAIS_TYPES](state, payload) {
      state.frais = {
        ...state.frais,
        ...payload,
      };
    },
    [types.UPDATE_ECRITURES_ANNUELS_LISTE](state, payload) {
      state.ecritures.annuels = [...payload];
    },
    [types.UPDATE_ECRITURES_AMENDES](state, payload) {
      state.amendes = payload;
    },
    [types.UPDATE_CURRENT_COMPTE_ECRITURES](state, payload) {
      state.active.ecritures = payload;
    },
    [types.SELECT_CURRENT_COMPTE](state, payload) {
      state.active.compteId = payload;
    },
    [types.ADD_FRAIS_ANNUEL](state, frais) {
      state.frais.annuels = [...state.frais.annuels, frais];
    },
    [types.UPDATE_FRAIS_ANNUEL](state, frais) {
      state.frais.annuels = [
        ...state.frais.annuels.map((m) => (m.id === frais.id ? frais : m)),
      ];
    },
    [types.REMOVE_FRAIS_ANNUEL](state, fraisId) {
      state.frais.annuels = state.frais.annuels.filter((m) => m.id != fraisId);
    },
    [types.ADD_INDEMNITE_ANNUEL](state, indemnite) {
      state.indemnites.annuels = [...state.indemnites.annuels, indemnite];
    },
    [types.UPDATE_INDEMNITE_ANNUEL](state, indemnite) {
      state.indemnites.annuels = [
        ...state.indemnites.annuels.map((m) =>
          m.id === indemnite.id ? indemnite : m
        ),
      ];
    },
    [types.REMOVE_INDEMNITE_ANNUEL](state, indemniteId) {
      state.indemnites.annuels = state.indemnites.annuels.filter(
        (m) => m.id != indemniteId
      );
    },
    [types.ADD_INDEMNITE_EXERCICE](state, indemnite) {
      state.indemnites.exercices = [...state.indemnites.exercices, indemnite];
    },
    [types.UPDATE_INDEMNITE_EXERCICE](state, indemnite) {
      state.indemnites.exercices = [
        ...state.indemnites.exercices.map((m) =>
          m.id === indemnite.id ? indemnite : m
        ),
      ];
    },
    [types.REMOVE_INDEMNITE_EXERCICE](state, indemniteId) {
      state.indemnites.exercices = state.indemnites.exercices.filter(
        (m) => m.id != indemniteId
      );
    },
    [types.ADD_INDEMNITE_INTERVENTION](state, indemnite) {
      state.indemnites.interventions = [
        ...state.indemnites.interventions,
        indemnite,
      ];
    },
    [types.UPDATE_INDEMNITE_INTERVENTION](state, indemnite) {
      state.indemnites.interventions = [
        ...state.indemnites.interventions.map((m) =>
          m.id === indemnite.id ? indemnite : m
        ),
      ];
    },
    [types.REMOVE_INDEMNITE_INTERVENTION](state, indemniteId) {
      state.indemnites.interventions = state.indemnites.interventions.filter(
        (m) => m.id != indemniteId
      );
    },
  },
  actions: {
    selectActiveCompte({ commit, dispatch }, payload) {
      commit(types.SELECT_CURRENT_COMPTE, payload);
      return dispatch('fetchEcritureComptes');
    },
    fetchEcritureComptes({ state, getters, commit }) {
      return ComptabiliteService.getEcritureForCompte(
        state.active.compteId,
        getters.currentExerciceComptableId
      ).then((data) => {
        return commit(types.UPDATE_CURRENT_COMPTE_ECRITURES, data);
      });
    },
    fetchIndemnitesTypes({ commit }) {
      return ComptabiliteService.getIndemniteTypes().then((data) =>
        commit(types.UPDATE_INDEMNITES_TYPES, data)
      );
    },
    fetchFraisTypes({ commit }) {
      return ComptabiliteService.getFraisTypes().then((data) =>
        commit(types.UPDATE_FRAIS_TYPES, data)
      );
    },
    fetchEcrituresAnnuels({ commit, getters }) {
      return ComptabiliteService.getEcrituresAnnuelsForExerciceComptable(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_ECRITURES_ANNUELS_LISTE, data));
    },
    fetchAmendes({ commit, getters }) {
      return ComptabiliteService.getAmendesForExerciceComptable(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_ECRITURES_AMENDES, data));
    },
    imputerExercice({ commit }, payload) {
      return ComptabiliteService.imputerExercice(
        payload.exercice_id,
        payload
      ).then((data) => {
        commit(types.UPDATE_EXERCICE_STATUT, {
          id: payload.exercice_id,
          statut: data.statut,
        });
        return data;
      });
    },
    imputerIntervention({ commit }, payload) {
      return ComptabiliteService.imputerIntervention(
        payload.intervention_id,
        payload
      ).then((data) => {
        commit(types.UPDATE_INTERVENTION_STATUT, {
          id: payload.intervention_id,
          statut: data.statut,
        });
        return data;
      });
    },
    imputerAnnuel({ commit, getters }) {
      return ComptabiliteService.imputerAnnuel(
        getters.currentExerciceComptableId
      ).then((data) => {
        commit(types.UPDATE_ECRITURES_ANNUELS_LISTE, [
          ...data.indemnites,
          ...data.frais,
        ]);
        return data;
      });
    },
    genererAmendesAnnuels({ commit }, exerciceComptableId) {
      return ComptabiliteService.genererAmendesAnnuels(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_ECRITURES_AMENDES, data));
    },
    genererAmendesPourSapeur(
      { commit },
      { exerciceComptableId, sapeurId, tarifs }
    ) {
      return ComptabiliteService.genererAmendesAnnuels(
        exerciceComptableId,
        sapeurId,
        tarifs
      )
        .then //data =>
        // commit(types.UPDATE_COURS_LISTE, data)
        //TODO
        ();
    },
    addFraisAnnuel({ commit }, frais) {
      return ComptabiliteService.addFraisAnnuel(frais).then((data) => {
        commit(types.ADD_FRAIS_ANNUEL, data);
        return data;
      });
    },
    updateFraisAnnuel({ commit }, frais) {
      return ComptabiliteService.updateFraisAnnuel(frais).then((data) => {
        commit(types.UPDATE_FRAIS_ANNUEL, data);
        return data;
      });
    },
    removeFraisAnnuel({ commit }, frais) {
      return ComptabiliteService.removeFraisAnnuel(frais).then((data) => {
        commit(types.REMOVE_FRAIS_ANNUEL, data);
        return data;
      });
    },
    addIndemniteAnnuel({ commit }, indemnite) {
      return ComptabiliteService.addIndemniteAnnuel(indemnite).then((data) => {
        commit(types.ADD_INDEMNITE_ANNUEL, data);
        return data;
      });
    },
    updateIndemniteAnnuel({ commit }, indemnite) {
      return ComptabiliteService.updateIndemniteAnnuel(indemnite).then(
        (data) => {
          commit(types.UPDATE_INDEMNITE_ANNUEL, data);
          return data;
        }
      );
    },
    removeIndemniteAnnuel({ commit }, indemnite) {
      return ComptabiliteService.removeIndemniteAnnuel(indemnite).then(
        (data) => {
          commit(types.REMOVE_INDEMNITE_ANNUEL, data);
          return data;
        }
      );
    },
    addIndemniteExercice({ commit }, indemnite) {
      return ComptabiliteService.addIndemniteExercice(indemnite).then(
        (data) => {
          commit(types.ADD_INDEMNITE_EXERCICE, data);
          return data;
        }
      );
    },
    updateIndemniteExercice({ commit }, indemnite) {
      return ComptabiliteService.updateIndemniteExercice(indemnite).then(
        (data) => {
          commit(types.UPDATE_INDEMNITE_EXERCICE, data);
          return data;
        }
      );
    },
    removeIndemniteExercice({ commit }, indemnite) {
      return ComptabiliteService.removeIndemniteExercice(indemnite).then(
        (data) => {
          commit(types.REMOVE_INDEMNITE_EXERCICE, data);
          return data;
        }
      );
    },
    addIndemniteIntervention({ commit }, indemnite) {
      return ComptabiliteService.addIndemniteIntervention(indemnite).then(
        (data) => {
          commit(types.ADD_INDEMNITE_INTERVENTION, data);
          return data;
        }
      );
    },
    updateIndemniteIntervention({ commit }, indemnite) {
      return ComptabiliteService.updateIndemniteIntervention(indemnite).then(
        (data) => {
          commit(types.UPDATE_INDEMNITE_INTERVENTION, data);
          return data;
        }
      );
    },
    removeIndemniteIntervention({ commit }, indemnite) {
      return ComptabiliteService.removeIndemniteIntervention(indemnite).then(
        (data) => {
          commit(types.REMOVE_INDEMNITE_INTERVENTION, data);
          return data;
        }
      );
    },
  },
};
