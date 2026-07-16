import { defineStore } from "pinia";
import TravailTypeService from "../../services/TravailTypeService.js";

export const useTravailTypeStore = defineStore("travailType", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchTravailTypes() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      }
      const data = await TravailTypeService.getTypes();
      this.liste = data.slice(0).sort((t1, t2) => t1.designation > t2.designation);
      return data;
    },
    async addTravailType(type) {
      const data = await TravailTypeService.addType(type);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateTravailType(type) {
      const data = await TravailTypeService.updateType(type);
      this.liste = this.liste.map((m) => (m.id === data.id ? data : m));
      return data;
    },
    async removeTravailType(typeId) {
      const data = await TravailTypeService.removeType(typeId);
      this.liste = this.liste.filter((m) => m.id != typeId);
      return data;
    },
  },
});
