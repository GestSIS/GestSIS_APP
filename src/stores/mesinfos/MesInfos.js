import AbsenceService from "../../services/AbsenceService.js";
import ExerciceService from "../../services/ExerciceService.js";
import MesInfosService from "../../services/MesInfosService.js";

import { defineStore } from "pinia";

export const useMesInfosStore = defineStore("mes-infos", {
  state: () => ({
    infos: {},
    fonctions: [],
    grades: [],
    cours: [],
    groupes: [],
    mutations: [],
    materiels: [],
    travaux: [],
    controlesMedicaux: [],
    exercices: [],
    absences: [],
    interventions: [],
    paiements: [],
    ecritures: [],
    permis: [],
  }),
  actions: {
    async fetchMesInfos() {
      this.infos = await MesInfosService.getMesInfos();
    },
    async fetchMonMateriel() {
      this.materiels = await MesInfosService.getMonMateriel();
    },
    async fetchMesCours() {
      this.cours = await MesInfosService.getMesCours();
    },
    async fetchMesPermis() {
      this.permis = await MesInfosService.getMesPermis();
    },
    async fetchMesFonctions() {
      this.fonctions = await MesInfosService.getMesFonctions();
    },
    async fetchMesGrades() {
      this.grades = await MesInfosService.getMesGrades();
    },
    async fetchMesGroupes() {
      this.groupes = await MesInfosService.getMesGroupes();
    },
    async fetchMesMutations() {
      this.mutations = await MesInfosService.getMesMutations();
    },
    async fetchMesTravaux(exerciceComptableId) {
      this.travaux = await MesInfosService.getMesTravaux(exerciceComptableId);
    },
    async fetchMesExercices(exerciceComptableId) {
      this.exercices = await MesInfosService.getMesExercices(exerciceComptableId);
    },
    async fetchMesControlesMedicaux() {
      this.controlesMedicaux = await MesInfosService.getMesControlesMedicaux();
    },
    async fetchMesAbsences(exerciceComptableId) {
      this.absences = await MesInfosService.getMesAbsences(exerciceComptableId);
    },
    async fetchMesInterventions(exerciceComptableId) {
      this.interventions = await MesInfosService.getMesInterventions(exerciceComptableId);
    },
    async fetchMesDecomptes(exerciceComptableId) {
      const data = await MesInfosService.getMesDecomptes(exerciceComptableId);
      this.ecritures = data.ecritures;
      this.paiements = data.paiements;
    },
    async addMonAbsence(absence) {
      const data = await AbsenceService.addMonAbsence(absence);
      this.absences.push(data);
      return data;
    },
    async editMonAbsence(absence) {
      const data = await AbsenceService.updateMonAbsence(absence);
      this.absences = this.absences.map((a) => (a.id === data.id ? data : a));
      return data;
    },
    async removeMonAbsence(absence) {
      const data = await AbsenceService.removeMonAbsence(absence.id);
      this.absences = this.absences.filter((a) => a.id !== absence.id);
      return data;
    },
    async addMonExcuse(excuse) {
      const data = await ExerciceService.createMonExcuse(excuse.exercice_id, excuse);
      this.exercices = this.exercices.map((p) =>
        p.presence?.id == data.id ? { ...p, presence: data } : p,
      );
      return data;
    },
    async removeMonExcuse(exercice) {
      const data = await ExerciceService.removeMonExcuse(exercice.id);
      this.exercices = this.exercices.map((p) =>
        p.presence?.id == data.id ? { ...p, presence: data } : p,
      );
      return data;
    },
  },
});
