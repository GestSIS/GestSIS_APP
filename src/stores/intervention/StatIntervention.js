import { defineStore } from "pinia";
import StatInterventionService from "../../services/StatInterventionService.js";

export const useStatInterventionStore = defineStore("statIntervention", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchStatInterventions() {
      if (this.liste.length > 0) return;
      this.liste = (await StatInterventionService.getStats())
        .slice(0)
        .sort((t1, t2) => t1.designation.localeCompare(t2.designation));
    },
    async addStatIntervention(stat) {
      const data = await StatInterventionService.addStat(stat);
      this.liste.push(data);
      return data;
    },
    async updateStatIntervention(stat) {
      const data = await StatInterventionService.updateStat(stat);
      this.liste = this.liste.map((m) => (m.id === stat.id ? data : m));
      return data;
    },
    async removeStatIntervention(statId) {
      const data = await StatInterventionService.removeStat(statId);
      this.liste = this.liste.filter((m) => m.id != statId);
      return data;
    },
  },
});
