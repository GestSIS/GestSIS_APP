import { defineStore } from "pinia";
import ControlesMedicauxTypeService from "../../services/ControlesMedicauxTypeService.js";

export const useControleMedicalTypeStore = defineStore("controleMedicalType", {
  state: () => ({
    liste: [],
  }),
  actions: {
    clearCache() {
      this.liste = [];
    },
    async fetchTypes() {
      if (this.liste.length > 0) {
        return;
      }
      this.liste = await ControlesMedicauxTypeService.getTypes();
    },
    async addType(type) {
      const data = await ControlesMedicauxTypeService.addType(type);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateType(type) {
      const data = await ControlesMedicauxTypeService.updateType(type);
      this.liste = this.liste.map((m) => (m.id === data.id ? data : m));
      return data;
    },
    async removeType(typeId) {
      const data = await ControlesMedicauxTypeService.removeType(typeId);
      this.liste = this.liste.filter((m) => m.id != typeId);
      return data;
    },
  },
});
