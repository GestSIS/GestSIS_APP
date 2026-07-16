import { defineStore } from "pinia";
import InterventionTraitementService from "../../services/InterventionTraitementService.js";

export const useInterventionTraitementStore = defineStore("interventionTraitement", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchTraitements() {
      if (this.liste.length > 0) return;
      this.liste = (await InterventionTraitementService.getTraitements())
        .slice(0)
        .sort((t1, t2) => t1.designation.localeCompare(t2.designation));
    },
    async addTraitement(traitement) {
      const data = await InterventionTraitementService.addTraitement(traitement);
      this.liste.push(data);
      return data;
    },
    async updateTraitement(traitement) {
      const data = await InterventionTraitementService.updateTraitement(traitement);
      this.liste = this.liste.map((m) => (m.id === traitement.id ? data : m));
      return data;
    },
    async removeTraitement(traitementId) {
      const data = await InterventionTraitementService.removeTraitement(traitementId);
      this.liste = this.liste.filter((m) => m.id != traitementId);
      return data;
    },
  },
});
