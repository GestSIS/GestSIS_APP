import types from '../mutationTypes';
import ImputationService from '../../services/ImputationService.js';

export default {
  state: {
    fraisIndemnites: {
      exercices: [],
      interventions: [],
      annuels: [],
    },
    ecritures: {
      annuels: [],
      amendes: [],
      divers: [],
    },
    active: {
      compteId: null,
      ecritures: [],
    },
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.fraisIndemnites = {
        exercices: [],
        interventions: [],
        annuels: [],
      };
      state.ecritures = {
        annuels: [],
        amendes: [],
      };
      state.active = {
        compteId: null,
        ecritures: [],
      };
    },
    [types.ADD_ECRITURE](state, ecriture) {
      if (ecriture.module == 0) {
        state.ecritures.divers.push(ecriture);
      }
    },
    [types.UPDATE_ECRITURE](state, ecriture) {
      if (ecriture.module == 0) {
        state.ecritures.divers = state.ecritures.divers.map((e) =>
          e.id == ecriture.id ? ecriture : e
        );
      }
    },
    [types.REMOVE_ECRITURE](state, ecritureId) {
      state.ecritures.divers = state.ecritures.divers.filter(
        (e) => e.id != ecritureId
      );
      state.ecritures.amendes = state.ecritures.amendes.filter(
        (e) => e.id != ecritureId
      );
      state.ecritures.annuels = state.ecritures.annuels.filter(
        (e) => e.id != ecritureId
      );
    },
    [types.UPDATE_COMPTE_LISTE](state, payload) {
      if (state.active.compteId === null && payload.length > 0) {
        state.active.compteId = payload[0].id;
      }
    },
    [types.UPDATE_FRAIS_INDEMNITES_TYPES](state, payload) {
      state.fraisIndemnites = {
        ...state.fraisIndemnites,
        ...payload,
      };
    },
    [types.UPDATE_ECRITURES_ANNUEL_TYPES_LISTE](state, payload) {
      state.ecritures.annuels = [...payload];
    },
    [types.UPDATE_ECRITURES_AMENDES](state, payload) {
      state.ecritures.amendes = payload;
    },
    [types.UPDATE_ECRITURES_DIVERS_LISTE](state, payload) {
      state.ecritures.divers = payload;
    },
    [types.UPDATE_CURRENT_COMPTE_ECRITURES](state, payload) {
      state.active.ecritures = payload;
    },
    [types.SELECT_CURRENT_COMPTE](state, payload) {
      state.active.compteId = payload;
    },
    [types.ADD_FRAIS_INDEMNITE_ANNUEL](state, fraisIndemnite) {
      state.fraisIndemnites.annuels = [
        ...state.fraisIndemnites.annuels.map((f) => {
          if (f.id === fraisIndemnite.frais_indemnite_annuel_type_id) {
            return {
              ...f,
              frais_indemnite_annuels: [
                ...f.frais_indemnite_annuels,
                fraisIndemnite,
              ],
            };
          } else {
            return f;
          }
        }),
      ];
    },
    [types.UPDATE_FRAIS_INDEMNITE_ANNUEL](state, fraisIndemnite) {
      state.fraisIndemnites.annuels = [
        ...state.fraisIndemnites.annuels.map((f) => {
          if (f.id === fraisIndemnite.frais_indemnite_annuel_type_id) {
            return {
              ...f,
              frais_indemnite_annuels: [
                ...f.frais_indemnite_annuels.filter(
                  (e) => e.id != fraisIndemnite.id
                ),
                fraisIndemnite,
              ],
            };
          } else {
            return f;
          }
        }),
      ];
    },
    [types.REMOVE_FRAIS_INDEMNITE_ANNUEL](state, fraisIndemniteId) {
      state.fraisIndemnites.annuels = [
        ...state.fraisIndemnites.annuels.map((f) => {
          return {
            ...f,
            frais_indemnite_annuels: f.frais_indemnite_annuels.filter(
              (e) => e.id != fraisIndemniteId
            ),
          };
        }),
      ];
    },
    [types.ADD_FRAIS_INDEMNITE_ANNUEL_TYPE](state, fraisIndemnite) {
      state.fraisIndemnites.annuels = [
        ...state.fraisIndemnites.annuels,
        fraisIndemnite,
      ];
    },
    [types.UPDATE_FRAIS_INDEMNITE_ANNUEL_TYPE](state, fraisIndemnite) {
      state.fraisIndemnites.annuels = [
        ...state.fraisIndemnites.annuels.map((m) =>
          m.id === fraisIndemnite.id ? { ...m, ...fraisIndemnite } : m
        ),
      ];
    },
    [types.REMOVE_FRAIS_INDEMNITE_ANNUEL_TYPE](state, fraisIndemniteId) {
      state.fraisIndemnites.annuels = state.fraisIndemnites.annuels.filter(
        (m) => m.id != fraisIndemniteId
      );
    },
    [types.ADD_INDEMNITE_EXERCICE](state, indemnite) {
      state.fraisIndemnites.exercices = [
        ...state.fraisIndemnites.exercices,
        indemnite,
      ];
    },
    [types.UPDATE_INDEMNITE_EXERCICE](state, indemnite) {
      state.fraisIndemnites.exercices = [
        ...state.fraisIndemnites.exercices.map((m) =>
          m.id === indemnite.id ? indemnite : m
        ),
      ];
    },
    [types.REMOVE_INDEMNITE_EXERCICE](state, indemniteId) {
      state.fraisIndemnites.exercices = state.fraisIndemnites.exercices.filter(
        (m) => m.id != indemniteId
      );
    },
    [types.ADD_INDEMNITE_INTERVENTION](state, indemnite) {
      state.fraisIndemnites.interventions = [
        ...state.fraisIndemnites.interventions,
        indemnite,
      ];
    },
    [types.UPDATE_INDEMNITE_INTERVENTION](state, indemnite) {
      state.fraisIndemnites.interventions = [
        ...state.fraisIndemnites.interventions.map((m) =>
          m.id === indemnite.id ? indemnite : m
        ),
      ];
    },
    [types.REMOVE_INDEMNITE_INTERVENTION](state, indemniteId) {
      state.fraisIndemnites.interventions =
        state.fraisIndemnites.interventions.filter((m) => m.id != indemniteId);
    },
  },
  actions: {
    selectActiveCompte({ commit, dispatch }, compteId) {
      commit(types.SELECT_CURRENT_COMPTE, compteId);
      return dispatch('fetchEcritureComptes', compteId);
    },

    addEcriture({ commit }, ecriture) {
      return ImputationService.addEcriture(ecriture).then((data) => {
        commit(types.ADD_ECRITURE, data);
        return data;
      });
    },
    updateEcriture({ commit }, ecriture) {
      return ImputationService.updateEcriture(ecriture).then((data) => {
        commit(types.UPDATE_ECRITURE, data);
        return data;
      });
    },
    removeEcriture({ commit }, ecritureId) {
      return ImputationService.removeEcriture(ecritureId).then((data) => {
        commit(types.REMOVE_ECRITURE, ecritureId);
        return data;
      });
    },

    fetchEcritureComptes({ state, getters, commit }, compteId) {
      return ImputationService.getEcritureForCompte(
        compteId ?? state.active.compteId,
        getters.currentExerciceComptableId
      ).then((data) => {
        return commit(types.UPDATE_CURRENT_COMPTE_ECRITURES, data);
      });
    },
    fetchFraisIndemnitesTypes({ commit }) {
      return ImputationService.getFraisIndemniteTypes().then((data) =>
        commit(types.UPDATE_FRAIS_INDEMNITES_TYPES, data)
      );
    },
    fetchEcrituresAnnuels({ commit, getters }) {
      return ImputationService.getEcrituresAnnuelsForExerciceComptable(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_ECRITURES_ANNUEL_TYPES_LISTE, data));
    },
    fetchEcrituresDivers({ commit, getters }) {
      return ImputationService.getEcrituresDiversForExerciceComptable(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_ECRITURES_DIVERS_LISTE, data));
    },
    fetchAmendesExerciceComptable({ commit, getters }) {
      return ImputationService.getAmendesForExerciceComptable(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_ECRITURES_AMENDES, data));
    },
    imputerExercice({ commit }, payload) {
      return ImputationService.imputerExercice(
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
    annulerImputationExercice({ commit }, exerciceId) {
      return ImputationService.annulerImputationExercice(exerciceId).then(
        (data) => {
          commit(types.UPDATE_EXERCICE_STATUT, {
            id: exerciceId,
            statut: data.statut,
          });
          return data;
        }
      );
    },
    imputerIntervention({ commit }, payload) {
      return ImputationService.imputerIntervention(
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
    annulerImputationIntervention({ commit }, interventionId) {
      return ImputationService.annulerImputationIntervention(
        interventionId
      ).then((data) => {
        commit(types.UPDATE_INTERVENTION_STATUT, {
          id: interventionId,
          statut: data.statut,
        });
        return data;
      });
    },
    imputerAnnuel({ commit, getters }) {
      return ImputationService.imputerAnnuel(
        getters.currentExerciceComptableId
      ).then((data) => {
        commit(types.UPDATE_ECRITURES_ANNUEL_TYPES_LISTE, data);
        return data;
      });
    },
    genererAmendesAnnuels({ commit }, exerciceComptableId) {
      return ImputationService.genererAmendesAnnuels(exerciceComptableId).then(
        (data) => commit(types.UPDATE_ECRITURES_AMENDES, data)
      );
    },
    genererAmendesPourSapeur(
      { commit },
      { exerciceComptableId, sapeurId, tarifs }
    ) {
      return ImputationService.genererAmendesAnnuels(
        exerciceComptableId,
        sapeurId,
        tarifs
      )
        .then //data =>
        // commit(types.UPDATE_COURS_LISTE, data)
        //TODO:
        ();
    },
    addFraisIndemniteAnnuel({ commit }, frais) {
      return ImputationService.addFraisIndemniteAnnuel(frais).then((data) => {
        commit(types.ADD_FRAIS_INDEMNITE_ANNUEL, data);
        return data;
      });
    },
    updateFraisIndemniteAnnuel({ commit }, frais) {
      return ImputationService.updateFraisIndemniteAnnuel(frais).then(
        (data) => {
          commit(types.UPDATE_FRAIS_INDEMNITE_ANNUEL, data);
          return data;
        }
      );
    },
    removeFraisIndemniteAnnuel({ commit }, frais) {
      return ImputationService.removeFraisIndemniteAnnuel(frais).then(
        (data) => {
          commit(types.REMOVE_FRAIS_INDEMNITE_ANNUEL, frais);
          return data;
        }
      );
    },
    addFraisIndemniteAnnuelType({ commit }, frais) {
      return ImputationService.addFraisIndemniteAnnuelType(frais).then(
        (data) => {
          commit(types.ADD_FRAIS_INDEMNITE_ANNUEL_TYPE, data);
          return data;
        }
      );
    },
    updateFraisIndemniteAnnuelType({ commit }, frais) {
      return ImputationService.updateFraisIndemniteAnnuelType(frais).then(
        (data) => {
          commit(types.UPDATE_FRAIS_INDEMNITE_ANNUEL_TYPE, data);
          return data;
        }
      );
    },
    removeFraisIndemniteAnnuelType({ commit }, frais) {
      return ImputationService.removeFraisIndemniteAnnuelType(frais).then(
        (data) => {
          commit(types.REMOVE_FRAIS_INDEMNITE_ANNUEL_TYPE, frais);
          return data;
        }
      );
    },
    addIndemniteExercice({ commit }, indemnite) {
      return ImputationService.addIndemniteExercice(indemnite).then((data) => {
        commit(types.ADD_INDEMNITE_EXERCICE, data);
        return data;
      });
    },
    updateIndemniteExercice({ commit }, indemnite) {
      return ImputationService.updateIndemniteExercice(indemnite).then(
        (data) => {
          commit(types.UPDATE_INDEMNITE_EXERCICE, data);
          return data;
        }
      );
    },
    removeIndemniteExercice({ commit }, indemnite) {
      return ImputationService.removeIndemniteExercice(indemnite).then(
        (data) => {
          commit(types.REMOVE_INDEMNITE_EXERCICE, data);
          return data;
        }
      );
    },
    addIndemniteIntervention({ commit }, indemnite) {
      return ImputationService.addIndemniteIntervention(indemnite).then(
        (data) => {
          commit(types.ADD_INDEMNITE_INTERVENTION, data);
          return data;
        }
      );
    },
    updateIndemniteIntervention({ commit }, indemnite) {
      return ImputationService.updateIndemniteIntervention(indemnite).then(
        (data) => {
          commit(types.UPDATE_INDEMNITE_INTERVENTION, data);
          return data;
        }
      );
    },
    removeIndemniteIntervention({ commit }, indemnite) {
      return ImputationService.removeIndemniteIntervention(indemnite).then(
        (data) => {
          commit(types.REMOVE_INDEMNITE_INTERVENTION, data);
          return data;
        }
      );
    },
  },
};
