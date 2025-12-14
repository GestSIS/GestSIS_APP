import BatterieTypeService from '../../services/materiel/BatterieTypeService.js';
import { defineStore } from 'pinia';

export const useBatterieTypeStore = defineStore('batterie-type', {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchBatterieTypes() {
      if (this.liste.length > 0) {
        return;
      }
      const data = await BatterieTypeService.getBatterieTypes();
      this.liste = data.slice(0).sort((t1, t2) => t1.designation > t2.designation);
    },
    async addBatterieType(BatterieType) {
      const data = await BatterieTypeService.addBatterieType(BatterieType);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateBatterieType(BatterieType) {
      const data = await BatterieTypeService.updateBatterieType(BatterieType);
      this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
      return data;
    },
    async removeBatterieType(BatterieTypeId) {
      const data = await BatterieTypeService.removeBatterieType(BatterieTypeId);
      this.liste = this.liste.filter((m) => m.id != BatterieTypeId);
      return data;
    },
  },
});
