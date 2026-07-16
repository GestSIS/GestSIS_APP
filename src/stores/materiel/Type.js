import MaterielTypeService from "../../services/materiel/TypeService.js";
import { defineStore } from "pinia";

export const useMaterielTypeStore = defineStore("materielType", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchMaterielTypes() {
      if (this.liste.length > 0) {
        return;
      }
      const data = await MaterielTypeService.getTypes();
      this.liste = data.slice(0).sort((t1, t2) => t1.designation.localeCompare(t2.designation));
    },
    async addMaterielType(type) {
      const data = await MaterielTypeService.addType(type);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateMaterielType(type) {
      const data = await MaterielTypeService.updateType(type);
      this.liste = this.liste.map((m) => (m.id === data.id ? data : m));
      return data;
    },
    async removeMaterielType(typeId) {
      const data = await MaterielTypeService.removeType(typeId);
      this.liste = this.liste.filter((m) => m.id != typeId);
      return data;
    },
  },
});
