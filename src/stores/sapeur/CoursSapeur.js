import { defineStore } from "pinia";
import CoursSapeurService from "../../services/CoursSapeurService.js";

export const useCoursSapeurStore = defineStore("coursSapeur", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchCoursSapeurs(exerciceComptableId) {
      const data = await CoursSapeurService.getCoursSapeurs(exerciceComptableId);
      this.liste = data;
      return data;
    },
    updateCoursSapeurEcritureStatut(payload) {
      this.liste = this.liste.map((c) =>
        c.id == payload.id ? { ...c, ecritures: payload.ecritures } : c,
      );
    },
    async addCoursMultiple(payload) {
      const data = await CoursSapeurService.addCoursMultiple(payload);
      this.liste = [...this.liste, ...data.map((d) => d.cours)];
      return data;
    },
  },
});
