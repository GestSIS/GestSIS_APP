import types from '../mutationTypes';
import MesInfosService from '../../services/MesInfosService.js';

export default {
  state: {
    infos: {},
    fonctions: [],
    grades: [],
    cours: [],
    groupes: [],
    mutations: [],
    materiels: [],
    travaux: [],
    exercices: [],
    interventions: [],
    paiements: [],
    ecritures: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.infos = {};
      state.cours = [];
      state.fonctions = [];
      state.grades = [];
      state.groupes = [];
      state.mutations = [];
      state.materiels = [];
      state.travaux = [];
      state.exercices = [];
      state.interventions = [];
      state.paiements = [];
      state.ecritures = [];
    },
    [types.UPDATE_MES_INFOS](state, payload) {
      state.infos = payload;
    },
    [types.UPDATE_MON_MATERIEL](state, payload) {
      state.materiels = payload;
    },
    [types.UPDATE_MES_COURS](state, payload) {
      state.cours = payload;
    },
    [types.UPDATE_MES_FONCTIONS](state, payload) {
      state.fonctions = payload;
    },
    [types.UPDATE_MES_GRADES](state, payload) {
      state.grades = payload;
    },
    [types.UPDATE_MES_GROUPES](state, payload) {
      state.groupes = payload;
    },
    [types.UPDATE_MES_MUTATIONS](state, payload) {
      state.mutations = payload;
    },
    [types.UPDATE_MES_TRAVAUX](state, payload) {
      state.travaux = payload;
    },
    [types.UPDATE_MES_EXERCICES](state, payload) {
      state.exercices = payload;
    },
    [types.UPDATE_EXERCICE_PRESENCE](state, presence) {
      state.exercices = state.exercices.map((p) =>
        p.presence?.id == presence.id ? { ...p, presence } : p
      );
    },
    [types.UPDATE_MES_INTERVENTIONS](state, payload) {
      state.interventions = payload;
    },
    [types.UPDATE_MES_PAIEMENTS](state, payload) {
      state.paiements = payload;
    },
    [types.UPDATE_MES_ECRITURES](state, payload) {
      state.ecritures = payload;
    },
  },
  actions: {
    fetchMesInfos({ commit }) {
      return MesInfosService.getMesInfos().then((data) =>
        commit(types.UPDATE_MES_INFOS, data)
      );
    },
    fetchMonMateriel({ commit }) {
      return MesInfosService.getMonMateriel().then((data) =>
        commit(types.UPDATE_MON_MATERIEL, data)
      );
    },
    fetchMesCours({ commit }) {
      return MesInfosService.getMesCours().then((data) =>
        commit(types.UPDATE_MES_COURS, data)
      );
    },
    fetchMesFonctions({ commit }) {
      return MesInfosService.getMesFonctions().then((data) =>
        commit(types.UPDATE_MES_FONCTIONS, data)
      );
    },
    fetchMesGrades({ commit }) {
      return MesInfosService.getMesGrades().then((data) =>
        commit(types.UPDATE_MES_GRADES, data)
      );
    },
    fetchMesGroupes({ commit }) {
      return MesInfosService.getMesGroupes().then((data) =>
        commit(types.UPDATE_MES_GROUPES, data)
      );
    },
    fetchMesMutations({ commit }) {
      return MesInfosService.getMesMutations().then((data) =>
        commit(types.UPDATE_MES_MUTATIONS, data)
      );
    },
    fetchMesTravaux({ commit, getters }) {
      return MesInfosService.getMesTravaux(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_MES_TRAVAUX, data));
    },
    fetchMesExercices({ commit, getters }) {
      return MesInfosService.getMesExercices(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_MES_EXERCICES, data));
    },
    fetchMesInterventions({ commit, getters }) {
      return MesInfosService.getMesInterventions(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_MES_INTERVENTIONS, data));
    },
    fetchMesDecomptes({ commit, getters }) {
      return MesInfosService.getMesDecomptes(
        getters.activeExerciceComptableId
      ).then((data) => {
        commit(types.UPDATE_MES_ECRITURES, data.ecritures);
        return commit(types.UPDATE_MES_PAIEMENTS, data.paiements);
      });
    },
  },
};
