import UniteService from '../../services/UniteService.js';
import { defineStore } from 'pinia';

export const useUniteStore = defineStore('Unite', {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchUnites() {
      if (this.liste.length > 0) {
        return;
      }
      this.liste = await UniteService.getUnites();
    },
    async addUnite(Unite) {
      const data = await UniteService.addUnite(Unite);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateUnite(Unite) {
      const data = await UniteService.updateUnite(Unite);
      this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
      return data;
    },
    async removeUnite(UniteId) {
      const data = await UniteService.removeUnite(UniteId);
      this.liste = this.liste.filter((m) => m.id != UniteId);
      return data;
    },
  },
});
