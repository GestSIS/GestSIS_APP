import AbsenceService from '../../services/AbsenceService.js';
import ExerciceService from '../../services/ExerciceService.js';
import MesInfosService from '../../services/MesInfosService.js';

import { defineStore } from 'pinia';

export const useMesInfosStore = defineStore('mes-infos', {
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
    fetchMesInfos() {
      return MesInfosService.getMesInfos().then((data) =>
        this.infos = data
      );
    },
    fetchMonMateriel() {
      return MesInfosService.getMonMateriel().then((data) =>
        this.materiel = data
      );
    },
    fetchMesCours() {
      return MesInfosService.getMesCours().then((data) =>
        this.cours = data
      );
    },
    fetchMesPermis() {
      return MesInfosService.getMesPermis().then((data) =>
        this.permis = data
      );
    },
    fetchMesFonctions() {
      return MesInfosService.getMesFonctions().then((data) =>
        this.fonctions = data
      );
    },
    fetchMesGrades() {
      return MesInfosService.getMesGrades().then((data) =>
        this.grades = data
      );
    },
    fetchMesGroupes() {
      return MesInfosService.getMesGroupes().then((data) =>
        this.groupes = data
      );
    },
    fetchMesMutations() {
      return MesInfosService.getMesMutations().then((data) =>
        this.mutations = data
      );
    },
    fetchMesTravaux(exerciceComptableId) {
      return MesInfosService.getMesTravaux(exerciceComptableId).then((data) => this.travaux = data);
    },
    fetchMesExercices(exerciceComptableId) {
      return MesInfosService.getMesExercices(exerciceComptableId).then((data) => this.exercices = data);
    },
    fetchMesControlesMedicaux() {
      return MesInfosService.getMesControlesMedicaux().then((data) =>
        this.controlesMedicaux = data
      );
    },
    fetchMesAbsences(exerciceComptableId) {
      return MesInfosService.getMesAbsences(exerciceComptableId).then((data) => this.absences = data);
    },
    fetchMesInterventions(exerciceComptableId) {
      return MesInfosService.getMesInterventions(exerciceComptableId).then((data) => this.interventions = data);
    },
    fetchMesDecomptes(exerciceComptableId) {
      return MesInfosService.getMesDecomptes(exerciceComptableId).then((data) => {
        this.ecritures = data.ecritures;
        this.paiements = data.paiements;
      });
    },
    addMonAbsence(absence) {
      return AbsenceService.addMonAbsence(absence).then((data) => {
        this.absences.push(data)
        return data;
      });
    },
    editMonAbsence(absence) {
      return AbsenceService.updateMonAbsence(absence).then((data) => {
        this.absences = this.absences.map(a => a.id === data.id ? data : a);
        return data;
      });
    },
    removeMonAbsence(absence) {
      return AbsenceService.removeMonAbsence(absence.id).then((data) => {
        this.absences = this.absences.filter(a => a.id !== absence.id);
        return data;
      });
    },
    addMonExcuse(excuse) {
      return ExerciceService.createMonExcuse(excuse.exercice_id, excuse).then(
        (data) => {
          this.exercices = this.exercices.map((p) =>
            p.presence?.id == data.id ? { ...p, presence: data } : p
          );
          return data;
        }
      );
    },
    removeMonExcuse(exercice) {
      return ExerciceService.removeMonExcuse(exercice.id).then((data) => {
        this.exercices = this.exercices.map((p) =>
          p.presence?.id == data.id ? { ...p, presence: data } : p
        );
        return data;
      });
    },
  },
});
