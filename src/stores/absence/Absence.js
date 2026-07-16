import { defineStore } from "pinia";
import AbsenceService from "../../services/AbsenceService.js";

export const useAbsenceStore = defineStore("absence", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchAbsences(exerciceComptableId) {
      const data = await AbsenceService.getAbsences(exerciceComptableId);
      this.liste = data;
      return data;
    },
    async addAbsence(absence) {
      const data = await AbsenceService.addAbsence(absence);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateAbsence(absence) {
      const data = await AbsenceService.updateAbsence(absence);
      this.liste = this.liste.map((m) => (m.id === data.id ? data : m));
      return data;
    },
    async removeAbsence(absenceId) {
      const data = await AbsenceService.removeAbsence(absenceId);
      this.liste = this.liste.filter((m) => m.id != absenceId);
      return data;
    },
  },
});
