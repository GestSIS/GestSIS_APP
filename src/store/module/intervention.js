import types from '../mutationTypes';
import InterventionService from '../../services/InterventionService';

export default {
  state: {
    liste: [],
    active: {
      id: 0,
      sapeurs: [],
      data: {},
      missions: [],
      appels: [],
      quittances: [],
      vehicules: [],
      materiels: [],
      phases: [],
    },
  },
  mutations: {
    [types.UPDATE_INTERVENTION_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_INTERVENTION](state, payload) {
      state.liste = [...state.liste, payload];
      state.active.data = {
        ...payload,
      };
      state.active.id = payload.id;
    },
    [types.REMOVE_INTERVENTION](state, interventionId) {
      state.liste = [...state.liste.filter((i) => i.id != interventionId)];
    },
    [types.UPDATE_INTERVENTION_STATUT](state, payload) {
      state.liste = [
        ...state.liste.filter((e) => e.id !== payload.id),
        {
          ...state.liste.filter((e) => e.id === payload.id)[0],
          statut: payload.statut,
        },
      ];
    },
    [types.SELECT_CURRENT_INTERVENTION](state, payload) {
      state.active.id = payload;
    },
    [types.UPDATE_CURRENT_INTERVENTION_DATA](state, payload) {
      state.active.data = payload;
    },
    [types.UPDATE_CURRENT_INTERVENTION_SAPEURS](state, payload) {
      state.active.sapeurs = payload;
    },
    [types.UPDATE_CURRENT_INTERVENTION_QUITTANCES](state, payload) {
      state.active.quittances = payload;
    },
    [types.UPDATE_CURRENT_INTERVENTION_MATERIELS](state, payload) {
      state.active.materiels = payload;
    },
    [types.UPDATE_CURRENT_INTERVENTION_VEHICULES](state, payload) {
      state.active.vehicules = payload;
    },
    [types.UPDATE_CURRENT_INTERVENTION_MISSIONS](state, payload) {
      state.active.missions = payload;
    },
    [types.UPDATE_CURRENT_INTERVENTION_APPELS](state, payload) {
      state.active.appels = payload;
    },
    [types.UPDATE_CURRENT_INTERVENTION_PHASES](state, payload) {
      state.active.phases = payload;
    },

    //Materiel
    [types.REMOVE_CURRENT_INTERVENTION_MATERIEL](state, payload) {
      state.active.materiels = state.active.materiels.filter(
        (p) => p.id !== payload
      );
    },
    //Vehicule
    [types.REMOVE_CURRENT_INTERVENTION_VEHICULES](state, payload) {
      state.active.vehicules = state.active.vehicules.filter(
        (p) => !payload.includes(p.id)
      );
    },
    //Quittances
    [types.REMOVE_CURRENT_INTERVENTION_QUITTANCES](state, payload) {
      state.active.quittances = state.active.quittances.filter(
        (p) => p.id !== payload
      );
    },

    //Appels
    [types.REMOVE_CURRENT_INTERVENTION_APPEL](state, payload) {
      state.active.appels = state.active.appels.filter((p) => p.id !== payload);
    },

    //Missions
    [types.REMOVE_CURRENT_INTERVENTION_MISSION](state, payload) {
      state.active.missions = state.active.missions.filter(
        (p) => p.id !== payload
      );
    },

    //Sapeurs
    [types.REMOVE_CURRENT_INTERVENTION_SAPEUR](state, payload) {
      state.active.sapeurs = state.active.sapeurs.filter(
        (p) => p.id !== payload
      );
    },
    [types.EDIT_CURRENT_INTERVENTION_SAPEUR](state, payload) {
      state.active.sapeurs = [
        ...state.active.sapeurs.filter((p) => p.id !== payload.id),
        payload,
      ];
    },

    //Phases
    [types.REMOVE_CURRENT_INTERVENTION_PHASE](state, payload) {
      state.active.phases = state.active.phases.filter((p) => p.id !== payload);
    },
  },
  getters: {
    listInterventions: (state) => {
      return state.liste
        .slice(0)
        .sort((i1, i2) => new Date(i1.date_debut) - new Date(i2.date_debut));
    },
    activeInterventionId: (state) => {
      return state.active.id;
    },
    activeInterventionData: (state) => {
      return state.active.data;
    },
    getIntervention: (state) => (intervention_id) => {
      return state.liste.filter((e) => e.id === intervention_id)[0];
    },
  },
  actions: {
    fetchListeIntervention({ getters, commit }) {
      return InterventionService.getInterventions(
        getters.currentExerciceComptableId
      ).then((data) => commit(types.UPDATE_INTERVENTION_LISTE, data));
    },
    fetchIntervention({ commit }, payload) {
      return InterventionService.getIntervention(payload).then((data) =>
        commit(types.UPDATE_CURRENT_INTERVENTION_DATA, data)
      );
    },
    fetchInterventionSapeurs({ commit }, payload) {
      return InterventionService.getSapeurs(payload).then((data) =>
        commit(types.UPDATE_CURRENT_INTERVENTION_SAPEURS, data)
      );
    },
    fetchInterventionQuittances({ commit }, payload) {
      return InterventionService.getQuittances(payload).then((data) =>
        commit(types.UPDATE_CURRENT_INTERVENTION_QUITTANCES, data)
      );
    },
    fetchInterventionMateriels({ commit }, payload) {
      return InterventionService.getMateriels(payload).then((data) =>
        commit(types.UPDATE_CURRENT_INTERVENTION_MATERIELS, data)
      );
    },
    fetchInterventionVehicules({ commit }, payload) {
      return InterventionService.getVehicules(payload).then((data) =>
        commit(types.UPDATE_CURRENT_INTERVENTION_VEHICULES, data)
      );
    },
    fetchInterventionAppels({ commit }, payload) {
      return InterventionService.getAppels(payload).then((data) =>
        commit(types.UPDATE_CURRENT_INTERVENTION_APPELS, data)
      );
    },
    fetchInterventionMissions({ commit }, payload) {
      return InterventionService.getMissions(payload).then((data) =>
        commit(types.UPDATE_CURRENT_INTERVENTION_MISSIONS, data)
      );
    },
    fetchInterventionPhases({ commit }, payload) {
      return InterventionService.getPhases(payload).then((data) =>
        commit(types.UPDATE_CURRENT_INTERVENTION_PHASES, data)
      );
    },
    selectIntervention({ commit }, payload) {
      return commit(types.SELECT_CURRENT_INTERVENTION, payload);
    },
    resetActiveIntervention({ commit, getters }) {
      commit(types.SELECT_CURRENT_INTERVENTION, null);
      return commit(types.UPDATE_CURRENT_INTERVENTION_DATA, {
        id: null,
        date_debut: null,
        heure_debut: null,
        lieu: '',
        objet: '',
        date_fin: null,
        heure_fin: null,
        rapport_police: 0,
        degre: null,
        sauve_personne: 0,
        sauve_animaux: 0,
        description: '',
        proprietaire: '',
        responsable: '',
        stat_nb: 0,
        imputer: 0,
        exercice_comptable_id: getters.currentExerciceComptableId,
        localite_id: null,
        type_intervention_id: null,
        sapeur_id: null,
        stat_federal_id: null,
        intervention_traitement_id: null,
      });
    },
    createIntervention({ state, commit, getters }) {
      return InterventionService.createIntervention({
        ...state.active.data,
        exercice_comptable_id: getters.currentExerciceComptableId,
      }).then(async (data) => {
        await commit(types.ADD_INTERVENTION, data);
        await commit(types.SELECT_CURRENT_INTERVENTION, data.id);
        await commit(types.UPDATE_CURRENT_INTERVENTION_DATA, data);
        return data;
      });
    },
    removeIntervention({ commit }, interventionId) {
      return InterventionService.removeIntervention(interventionId).then(() => {
        return commit(types.REMOVE_INTERVENTION, interventionId);
      });
    },
    saveActiveIntervention({ state, commit }, payload) {
      return InterventionService.saveIntervention(
        state.active.id,
        payload
      ).then((data) => {
        commit(types.UPDATE_CURRENT_INTERVENTION_DATA, data);
        return data;
      });
    },
    validerIntervention({ commit }, payload) {
      return InterventionService.validerIntervention(payload).then((data) => {
        commit(types.UPDATE_INTERVENTION_STATUT, {
          id: payload,
          statut: data,
        });
        return data;
      });
    },

    //Materiel
    addInterventionMateriel({ state, commit }, payload) {
      return InterventionService.addMateriel(
        state.active.data.id,
        payload
      ).then((data) => {
        commit(types.UPDATE_CURRENT_INTERVENTION_MATERIELS, data);
        return data;
      });
    },
    editInterventionMateriel({ state, commit }, payload) {
      return InterventionService.editMateriel(
        state.active.data.id,
        payload
      ).then((data) => {
        commit(types.UPDATE_CURRENT_INTERVENTION_MATERIELS, data);
        return data;
      });
    },
    removeInterventionMateriel({ state, commit }, payload) {
      return InterventionService.removeMateriel(
        state.active.data.id,
        payload
      ).then((data) => {
        commit(types.REMOVE_CURRENT_INTERVENTION_MATERIEL, payload);
        return data;
      });
    },

    //Vehicules
    addInterventionVehicules({ state, commit }, payload) {
      return InterventionService.addVehicules(
        state.active.data.id,
        payload
      ).then((data) => {
        commit(types.UPDATE_CURRENT_INTERVENTION_VEHICULES, data);
        return data;
      });
    },
    removeInterventionVehicules({ state, commit }, payload) {
      return InterventionService.removeVehicules(
        state.active.data.id,
        payload
      ).then((data) => {
        commit(types.REMOVE_CURRENT_INTERVENTION_VEHICULES, payload);
        return data;
      });
    },

    //Quittances
    addQuittance({ state, commit }, payload) {
      return InterventionService.addQuittances(state.active.data.id, [
        payload,
      ]).then((data) => {
        commit(types.UPDATE_CURRENT_INTERVENTION_QUITTANCES, data);
        return data;
      });
    },
    removeQuittance({ state, commit }, payload) {
      return InterventionService.removeQuittances(state.active.data.id, [
        payload,
      ]).then((data) => {
        commit(types.REMOVE_CURRENT_INTERVENTION_QUITTANCES, payload);
        return data;
      });
    },

    //Missions
    addInterventionMission({ state, commit }, payload) {
      return InterventionService.addMission(state.active.data.id, payload).then(
        (data) => {
          commit(types.UPDATE_CURRENT_INTERVENTION_MISSIONS, data);
          return data;
        }
      );
    },
    editInterventionMission({ state, commit }, payload) {
      return InterventionService.editMission(
        state.active.data.id,
        payload
      ).then((data) => {
        commit(types.UPDATE_CURRENT_INTERVENTION_MISSIONS, data);
        return data;
      });
    },
    removeInterventionMission({ state, commit }, payload) {
      return InterventionService.removeMission(
        state.active.data.id,
        payload
      ).then((data) => {
        commit(types.REMOVE_CURRENT_INTERVENTION_MISSION, payload);
        return data;
      });
    },

    //Appels
    addInterventionAppel({ state, commit }, payload) {
      return InterventionService.addAppel(state.active.data.id, payload).then(
        (data) => {
          commit(types.UPDATE_CURRENT_INTERVENTION_APPELS, data);
          return data;
        }
      );
    },
    editInterventionAppel({ state, commit }, payload) {
      return InterventionService.editAppel(state.active.data.id, payload).then(
        (data) => {
          commit(types.UPDATE_CURRENT_INTERVENTION_APPELS, data);
          return data;
        }
      );
    },
    removeInterventionAppel({ state, commit }, payload) {
      return InterventionService.removeAppel(
        state.active.data.id,
        payload
      ).then((data) => {
        commit(types.REMOVE_CURRENT_INTERVENTION_APPEL, payload);
        return data;
      });
    },

    addPresences({ state, commit }, payload) {
      return InterventionService.addSapeurs(state.active.data.id, {
        sapeurs: payload,
      }).then(async (data) => {
        await commit(types.UPDATE_CURRENT_INTERVENTION_SAPEURS, data.sapeurs);
        await commit(types.UPDATE_INTERVENTION_STATUT, {
          id: state.active.id,
          statut: data.statut,
        });
        return data;
      });
    },
    editPresence({ state, commit }, payload) {
      return InterventionService.editSapeurs(state.active.data.id, {
        sapeurs: [payload],
      }).then((data) => {
        commit(types.EDIT_CURRENT_INTERVENTION_SAPEUR, payload);
        return data;
      });
    },
    removePresence({ state, commit }, payload) {
      return InterventionService.removeSapeurs(state.active.data.id, {
        sapeurs: [payload],
      }).then(async (data) => {
        await commit(types.REMOVE_CURRENT_INTERVENTION_SAPEUR, payload);
        await commit(types.UPDATE_INTERVENTION_STATUT, {
          id: state.active.id,
          statut: data,
        });
        return data;
      });
    },

    //Phases
    addPhase({ state, commit }, payload) {
      return InterventionService.addPhase(state.active.data.id, payload).then(
        (data) => {
          commit(types.UPDATE_CURRENT_INTERVENTION_PHASES, data);
          return data;
        }
      );
    },
    editPhase({ state, commit }, payload) {
      return InterventionService.editPhase(state.active.data.id, payload).then(
        (data) => {
          commit(types.UPDATE_CURRENT_INTERVENTION_PHASES, data);
          return data;
        }
      );
    },
    removePhase({ state, commit }, payload) {
      return InterventionService.removePhase(
        state.active.data.id,
        payload
      ).then((data) => {
        commit(types.REMOVE_CURRENT_INTERVENTION_PHASE, payload);
        return data;
      });
    },
  },
};
