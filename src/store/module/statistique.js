import types from '../mutationTypes';
import StatistiqueService from '../../services/StatistiqueService.js';

export default {
  state: {
    civilites: [],
    fonctions: [],
    grades: [],
    permis: [],
    materiels: [],
    vehicules: [],
    statFederal: [],
    typeIntervention: [],
    interventionTraitement: [],
    presencesExercice: [],
    presencesIntervention: [],
    comptes: [],
    modulesComptable: [],
    categoriesComptable: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.civilites = [];
      state.fonctions = [];
      state.grades = [];
      state.permis = [];
      state.materiels = [];
      state.vehicules = [];
      state.presencesExercice = [];
      state.presencesIntervention = [];
      state.statFederal = [];
      state.typeIntervention = [];
      state.interventionTraitement = [];
    },
    [types.UPDATE_STATISTIQUE_CIVILITE](state, payload) {
      state.civilites = payload;
    },
    [types.UPDATE_STATISTIQUE_FONCTION](state, payload) {
      state.fonctions = payload;
    },
    [types.UPDATE_STATISTIQUE_GRADE](state, payload) {
      state.grades = payload;
    },
    [types.UPDATE_STATISTIQUE_PERMIS](state, payload) {
      state.permis = payload;
    },
    [types.UPDATE_STATISTIQUE_VEHICULE](state, payload) {
      state.vehicules = payload;
    },
    [types.UPDATE_STATISTIQUE_MATERIEL](state, payload) {
      state.materiels = payload;
    },
    [types.UPDATE_STATISTIQUE_PRESENCE_EXERCICE](state, payload) {
      state.presencesExercice = payload;
    },
    [types.UPDATE_STATISTIQUE_PRESENCE_INTERVENTION](state, payload) {
      state.presencesIntervention = payload;
    },
    [types.UPDATE_STATISTIQUE_STAT_FEDERAL](state, payload) {
      state.statFederal = payload;
    },
    [types.UPDATE_STATISTIQUE_TYPE_INTERVENTION](state, payload) {
      state.typeIntervention = payload;
    },
    [types.UPDATE_STATISTIQUE_INTERVENTION_TRAITEMENT](state, payload) {
      state.interventionTraitement = payload;
    },
    [types.UPDATE_STATISTIQUE_COMPTE](state, payload) {
      state.comptes = payload;
    },
    [types.UPDATE_STATISTIQUE_MODULE_COMPTABLE](state, payload) {
      state.modulesComptable = payload;
    },
    [types.UPDATE_STATISTIQUE_CATEGORIE_COMPTABLE](state, payload) {
      state.categoriesComptable = payload;
    },
  },
  actions: {
    fetchStatistiqueCivilite({ getters, commit }) {
      return StatistiqueService.getStatCivilite(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_CIVILITE, data));
    },
    fetchStatistiqueFonction({ getters, commit }) {
      return StatistiqueService.getStatFonction(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_FONCTION, data));
    },
    fetchStatistiqueGrade({ getters, commit }) {
      return StatistiqueService.getStatGrade(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_GRADE, data));
    },
    fetchStatistiquePermis({ getters, commit }) {
      return StatistiqueService.getStatPermis(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_PERMIS, data));
    },
    fetchStatistiqueCategorieComptable({ getters, commit }) {
      return StatistiqueService.getStatCategorieComptable(
        getters.activeExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_CATEGORIE_COMPTABLE, data));
    },
    fetchStatistiqueCompte({ getters, commit }) {
      return StatistiqueService.getStatCompte(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_COMPTE, data));
    },
    fetchStatistiqueModuleComptable({ getters, commit }) {
      return StatistiqueService.getStatModuleComptable(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_MODULE_COMPTABLE, data));
    },
    fetchStatistiqueVehicule({ getters, commit }) {
      return StatistiqueService.getStatVehicule(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_VEHICULE, data));
    },
    fetchStatistiqueMateriel({ getters, commit }) {
      return StatistiqueService.getStatMateriel(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_MATERIEL, data));
    },
    fetchStatistiquePresenceExercice({ getters, commit }) {
      return StatistiqueService.getStatPresencesExercice(
        getters.activeExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_PRESENCE_EXERCICE, data)
      );
    },
    fetchStatistiquePresenceIntervention({ getters, commit }) {
      return StatistiqueService.getStatPresencesIntervention(
        getters.activeExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_PRESENCE_INTERVENTION, data)
      );
    },
    fetchStatistiqueTypeIntervention({ getters, commit }) {
      return StatistiqueService.getStatTypeIntervention(
        getters.activeExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_TYPE_INTERVENTION, data)
      );
    },
    fetchStatistiqueStatFederal({ getters, commit }) {
      return StatistiqueService.getStatStatFederal(
        getters.activeExerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_STAT_FEDERAL, data));
    },
    fetchStatistiqueTraitementIntervention({ getters, commit }) {
      return StatistiqueService.getStatTraitementIntervention(
        getters.activeExerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_INTERVENTION_TRAITEMENT, data)
      );
    },
  },
};
