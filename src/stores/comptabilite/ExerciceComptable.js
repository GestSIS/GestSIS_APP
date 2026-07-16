import { defineStore } from "pinia";
import ExerciceComptableService from "../../services/ExerciceComptableService.js";

export const useExerciceComptableStore = defineStore("exerciceComptable", {
  state: () => ({
    liste: [],
    activeId: null,
  }),
  getters: {
    activeExerciceComptableId: (state) => state.activeId,
  },
  actions: {
    async fetchExercicesComptables() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      }
      const data = await ExerciceComptableService.getExercices();
      this.liste = data;

      if ((this.activeId || 0) === 0) {
        // Select année en cours ou sinon, le dernier
        const anneeEnCours = new Date().getFullYear();
        const exerciceEnCours = data.find((e) => e.annee == anneeEnCours);
        this.activeId = exerciceEnCours?.id || data.sort((e1, e2) => e2.annee - e1.annee)[0]?.id;
      }

      return data;
    },
    selectExerciceComptable(exerciceId) {
      this.activeId = exerciceId;
    },
    async addExerciceComptable(exercice) {
      const data = await ExerciceComptableService.addExercice(exercice);
      this.liste.push(data);
      return data;
    },
    async updateExerciceComptable(exercice) {
      const data = await ExerciceComptableService.updateExercice(exercice);
      this.liste = this.liste
        .map((m) => (m.id === data.id ? data : m))
        .sort((e1, e2) => e2.annee - e1.annee);
      return data;
    },
    async removeExerciceComptable(exercice) {
      const data = await ExerciceComptableService.removeExercice(exercice);
      this.liste = this.liste.filter((m) => m.id != data);
      return data;
    },
  },
});
