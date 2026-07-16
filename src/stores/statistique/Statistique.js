import { defineStore } from "pinia";
import StatistiqueService from "../../services/StatistiqueService.js";

export const useStatistiqueStore = defineStore("statistique", {
  state: () => ({
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
  }),
  actions: {
    async fetchStatistiqueCivilite(exerciceComptableId) {
      const data = await StatistiqueService.getStatCivilite(exerciceComptableId);
      this.civilites = data;
      return data;
    },
    async fetchStatistiqueFonction(exerciceComptableId) {
      const data = await StatistiqueService.getStatFonction(exerciceComptableId);
      this.fonctions = data;
      return data;
    },
    async fetchStatistiqueGrade(exerciceComptableId) {
      const data = await StatistiqueService.getStatGrade(exerciceComptableId);
      this.grades = data;
      return data;
    },
    async fetchStatistiquePermis(exerciceComptableId) {
      const data = await StatistiqueService.getStatPermis(exerciceComptableId);
      this.permis = data;
      return data;
    },
    async fetchStatistiqueLocalite(exerciceComptableId) {
      const data = await StatistiqueService.getStatLocalite(exerciceComptableId);
      this.localites = data;
      return data;
    },
    async fetchStatistiqueCategorieComptable(exerciceComptableId) {
      const data = await StatistiqueService.getStatCategorieComptable(exerciceComptableId);
      this.categoriesComptable = data;
      return data;
    },
    async fetchStatistiqueCompte(exerciceComptableId) {
      const data = await StatistiqueService.getStatCompte(exerciceComptableId);
      this.comptes = data;
      return data;
    },
    async fetchStatistiqueModuleComptable(exerciceComptableId) {
      const data = await StatistiqueService.getStatModuleComptable(exerciceComptableId);
      this.modulesComptable = data;
      return data;
    },
    async fetchStatistiqueVehicule(exerciceComptableId) {
      const data = await StatistiqueService.getStatVehicule(exerciceComptableId);
      this.vehicules = data;
      return data;
    },
    async fetchStatistiqueMateriel(exerciceComptableId) {
      const data = await StatistiqueService.getStatMateriel(exerciceComptableId);
      this.materiels = data;
      return data;
    },
    async fetchStatistiquePresenceExercice(exerciceComptableId) {
      const data = await StatistiqueService.getStatPresencesExercice(exerciceComptableId);
      this.presencesExercice = data;
      return data;
    },
    async fetchStatistiquePresenceIntervention(exerciceComptableId) {
      const data = await StatistiqueService.getStatPresencesIntervention(exerciceComptableId);
      this.presencesIntervention = data;
      return data;
    },
    async fetchStatistiqueTypeIntervention(exerciceComptableId) {
      const data = await StatistiqueService.getStatTypeIntervention(exerciceComptableId);
      this.typeIntervention = data;
      return data;
    },
    async fetchStatistiqueStatFederal(exerciceComptableId) {
      const data = await StatistiqueService.getStatStatFederal(exerciceComptableId);
      this.statFederal = data;
      return data;
    },
    async fetchStatistiqueTraitementIntervention(exerciceComptableId) {
      const data = await StatistiqueService.getStatTraitementIntervention(exerciceComptableId);
      this.interventionTraitement = data;
      return data;
    },
  },
});
