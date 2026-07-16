import { defineStore } from "pinia";
import TypeInterventionService from "../../services/TypeInterventionService.js";

export const useTypeInterventionStore = defineStore("typeIntervention", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchTypeInterventions() {
      if (this.liste.length > 0) return;
      this.liste = (await TypeInterventionService.getTypes())
        .slice(0)
        .sort((t1, t2) => t1.designation.localeCompare(t2.designation));
    },
    async addTypeIntervention(type) {
      const data = await TypeInterventionService.addType(type);
      this.liste.push(data);
      return data;
    },
    async updateTypeIntervention(type) {
      const data = await TypeInterventionService.updateType(type);
      this.liste = this.liste.map((m) => (m.id === type.id ? data : m));
      return data;
    },
    async removeTypeIntervention(typeId) {
      const data = await TypeInterventionService.removeType(typeId);
      this.liste = this.liste.filter((m) => m.id != typeId);
      return data;
    },
  },
});
