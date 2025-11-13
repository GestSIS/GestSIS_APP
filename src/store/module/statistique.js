import types from '../mutationTypes';
import StatistiqueService from '../../services/StatistiqueService.js';

export default {
  state: {
    civilites: [],
    fonctions: [],
    grades: [],
    permis: [],
    localites: [],
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
      state.localites = [];
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
    [types.UPDATE_STATISTIQUE_LOCALITE](state, payload) {
      state.localites = payload;
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
    fetchStatistiqueCivilite({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatCivilite(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_CIVILITE, data));
    },
    fetchStatistiqueFonction({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatFonction(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_FONCTION, data));
    },
    fetchStatistiqueGrade({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatGrade(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_GRADE, data));
    },
    fetchStatistiquePermis({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatPermis(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_PERMIS, data));
    },
    fetchStatistiqueLocalite({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatLocalite(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_LOCALITE, data));
    },
    fetchStatistiqueCategorieComptable({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatCategorieComptable(
        exerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_CATEGORIE_COMPTABLE, data)
      );
    },
    fetchStatistiqueCompte({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatCompte(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_COMPTE, data));
    },
    fetchStatistiqueModuleComptable({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatModuleComptable(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_MODULE_COMPTABLE, data));
    },
    fetchStatistiqueVehicule({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatVehicule(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_VEHICULE, data));
    },
    fetchStatistiqueMateriel({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatMateriel(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_MATERIEL, data));
    },
    fetchStatistiquePresenceExercice({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatPresencesExercice(
        exerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_PRESENCE_EXERCICE, data)
      );
    },
    fetchStatistiquePresenceIntervention({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatPresencesIntervention(
        exerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_PRESENCE_INTERVENTION, data)
      );
    },
    fetchStatistiqueTypeIntervention({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatTypeIntervention(
        exerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_TYPE_INTERVENTION, data)
      );
    },
    fetchStatistiqueStatFederal({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatStatFederal(
        exerciceComptableId
      ).then((data) => commit(types.UPDATE_STATISTIQUE_STAT_FEDERAL, data));
    },
    fetchStatistiqueTraitementIntervention({ commit }, exerciceComptableId) {
      return StatistiqueService.getStatTraitementIntervention(
        exerciceComptableId
      ).then((data) =>
        commit(types.UPDATE_STATISTIQUE_INTERVENTION_TRAITEMENT, data)
      );
    },
  },
};
