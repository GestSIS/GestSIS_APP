import { defineStore } from "pinia";
import StatFederalService from "../../services/StatFederalService.js";

export const useStatFederalStore = defineStore("statFederal", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchStatFederals() {
      if (this.liste.length > 0) return;
      this.liste = (await StatFederalService.getStats())
        .slice(0)
        .sort((t1, t2) => t1.designation.localeCompare(t2.designation));
    },
  },
});
