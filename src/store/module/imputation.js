import types from '../mutationTypes';
import ImputationService from '../../services/ImputationService';

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
      state.indemnites = {
        exercices: [],
        interventions: [],
        annuels: [],
      };
      state.frais = {
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
      if (ecriture.type == 0) {
        state.ecritures.divers.push(ecriture);
      }
    },
    [types.UPDATE_ECRITURE](state, ecriture) {
      if (ecriture.type == 0) {
        state.ecritures.divers = state.ecritures.divers.map(e => e.id == ecriture.id ? ecriture : e);
      }
    },
    [types.REMOVE_ECRITURE](state, ecritureId) {
      state.ecritures.divers = state.ecritures.divers.filter(e => e.id != ecritureId);
      state.ecritures.amendes = state.ecritures.amendes.filter(e => e.id != ecritureId);
      state.ecritures.annuels = state.ecritures.annuels.filter(e => e.id != ecritureId);
    },
    [types.UPDATE_COMPTE_LISTE](state, payload) {
      if (state.active.compteId === null && payload.length > 0) {
        state.active.compteId = payload[0].id;
      }
    },
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
    [types.ADD_FRAIS_ANNUEL](state, frais) {
      state.frais.annuels = [
        ...state.frais.annuels.map((f) => {
          if (f.id === frais.frais_annuel_type_id) {
            return { ...f, fraisAnnuels: [...f.fraisAnnuels, frais] };
          } else {
            return f;
          }
        }),
      ];
    },
    [types.UPDATE_FRAIS_ANNUEL](state, frais) {
      state.frais.annuels = [
        ...state.frais.annuels.map((f) => {
          if (f.id === frais.frais_annuel_type_id) {
            return {
              ...f,
              fraisAnnuels: [
                ...f.fraisAnnuels.filter((e) => e.id != frais.id),
                frais,
              ],
            };
          } else {
            return f;
          }
        }),
      ];
    },
    [types.REMOVE_FRAIS_ANNUEL](state, fraisId) {
      state.frais.annuels = [
        ...state.frais.annuels.map((f) => {
          return {
            ...f,
            fraisAnnuels: f.fraisAnnuels.filter((e) => e.id != fraisId),
          };
        }),
      ];
    },
    [types.ADD_INDEMNITE_ANNUEL](state, indemnite) {
      state.indemnites.annuels = [
        ...state.indemnites.annuels.map((i) => {
          if (i.id === indemnite.indemnite_annuel_type_id) {
            return {
              ...i,
              indemniteAnnuels: [...i.indemniteAnnuels, indemnite],
            };
          } else {
            return i;
          }
        }),
      ];
    },
    [types.UPDATE_INDEMNITE_ANNUEL](state, indemnite) {
      state.indemnites.annuels = [
        ...state.indemnites.annuels.map((i) => {
          if (i.id === indemnites.indemnite_annuel_type_id) {
            return {
              ...i,
              indemniteAnnuels: [
                ...i.indemniteAnnuels.filter((e) => e.id != indemnite.id),
                indemnite,
              ],
            };
          } else {
            return i;
          }
        }),
      ];
    },
    [types.REMOVE_INDEMNITE_ANNUEL](state, indemniteId) {
      state.indemnites.annuels = [
        ...state.indemnites.annuels.map((f) => {
          return {
            ...f,
            indemniteAnnuels: f.indemniteAnnuels.filter(
              (e) => e.id != indemniteId
            ),
          };
        }),
      ];
    },
    [types.ADD_FRAIS_ANNUEL_TYPE](state, frais) {
      state.frais.annuels = [...state.frais.annuels, frais];
    },
    [types.UPDATE_FRAIS_ANNUEL_TYPE](state, frais) {
      state.frais.annuels = [
        ...state.frais.annuels.map((m) =>
          m.id === frais.id ? { ...m, ...frais } : m
        ),
      ];
    },
    [types.REMOVE_FRAIS_ANNUEL_TYPE](state, fraisId) {
      state.frais.annuels = state.frais.annuels.filter((m) => m.id != fraisId);
    },
    [types.ADD_INDEMNITE_ANNUEL_TYPE](state, indemnite) {
      state.indemnites.annuels = [...state.indemnites.annuels, indemnite];
    },
    [types.UPDATE_INDEMNITE_ANNUEL_TYPE](state, indemnite) {
      state.indemnites.annuels = [
        ...state.indemnites.annuels.map((m) =>
          m.id === indemnite.id ? { ...m, ...indemnite } : m
        ),
      ];
    },
    [types.REMOVE_INDEMNITE_ANNUEL_TYPE](state, indemniteId) {
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
    fetchIndemnitesTypes({ commit }) {
      return ImputationService.getIndemniteTypes().then((data) =>
        commit(types.UPDATE_INDEMNITES_TYPES, data)
      );
    },
    fetchFraisTypes({ commit }) {
      return ImputationService.getFraisTypes().then((data) =>
        commit(types.UPDATE_FRAIS_TYPES, data)
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
      return ImputationService.annulerImputationExercice(
        exerciceId,
      ).then((data) => {
        commit(types.UPDATE_EXERCICE_STATUT, {
          id: exerciceId,
          statut: data.statut,
        });
        return data;
      });
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
        interventionId,
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
        commit(types.UPDATE_ECRITURES_ANNUEL_TYPES_LISTE, [
          ...data.indemnites,
          ...data.frais,
        ]);
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
    addFraisAnnuel({ commit }, frais) {
      return ImputationService.addFraisAnnuel(frais).then((data) => {
        commit(types.ADD_FRAIS_ANNUEL, data);
        return data;
      });
    },
    updateFraisAnnuel({ commit }, frais) {
      return ImputationService.updateFraisAnnuel(frais).then((data) => {
        commit(types.UPDATE_FRAIS_ANNUEL, data);
        return data;
      });
    },
    removeFraisAnnuel({ commit }, frais) {
      return ImputationService.removeFraisAnnuel(frais).then((data) => {
        commit(types.REMOVE_FRAIS_ANNUEL, frais);
        return data;
      });
    },
    addIndemniteAnnuel({ commit }, indemnite) {
      return ImputationService.addIndemniteAnnuel(indemnite).then((data) => {
        commit(types.ADD_INDEMNITE_ANNUEL, data);
        return data;
      });
    },
    updateIndemniteAnnuel({ commit }, indemnite) {
      return ImputationService.updateIndemniteAnnuel(indemnite).then((data) => {
        commit(types.UPDATE_INDEMNITE_ANNUEL, data);
        return data;
      });
    },
    removeIndemniteAnnuel({ commit }, indemnite) {
      return ImputationService.removeIndemniteAnnuel(indemnite).then((data) => {
        commit(types.REMOVE_INDEMNITE_ANNUEL, indemnite);
        return data;
      });
    },
    addFraisAnnuelType({ commit }, frais) {
      return ImputationService.addFraisAnnuelType(frais).then((data) => {
        commit(types.ADD_FRAIS_ANNUEL_TYPE, data);
        return data;
      });
    },
    updateFraisAnnuelType({ commit }, frais) {
      return ImputationService.updateFraisAnnuelType(frais).then((data) => {
        commit(types.UPDATE_FRAIS_ANNUEL_TYPE, data);
        return data;
      });
    },
    removeFraisAnnuelType({ commit }, frais) {
      return ImputationService.removeFraisAnnuelType(frais).then((data) => {
        commit(types.REMOVE_FRAIS_ANNUEL_TYPE, frais);
        return data;
      });
    },
    addIndemniteAnnuelType({ commit }, indemnite) {
      return ImputationService.addIndemniteAnnuelType(indemnite).then(
        (data) => {
          commit(types.ADD_INDEMNITE_ANNUEL_TYPE, data);
          return data;
        }
      );
    },
    updateIndemniteAnnuelType({ commit }, indemnite) {
      return ImputationService.updateIndemniteAnnuelType(indemnite).then(
        (data) => {
          commit(types.UPDATE_INDEMNITE_ANNUEL_TYPE, data);
          return data;
        }
      );
    },
    removeIndemniteAnnuelType({ commit }, indemnite) {
      return ImputationService.removeIndemniteAnnuelType(indemnite).then(
        (data) => {
          commit(types.REMOVE_INDEMNITE_ANNUEL_TYPE, indemnite);
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
