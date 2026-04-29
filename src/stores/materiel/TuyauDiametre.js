import TuyauDiametreService from '../../services/materiel/TuyauDiametreService.js';
import { defineStore } from 'pinia';

export const useTuyauDiametreStore = defineStore('tuyau-diametre', {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchTuyauDiametres() {
      if (this.liste.length > 0) {
        return;
      }
      const data = await TuyauDiametreService.getTuyauDiametres();
      this.liste = data.slice(0).sort((t1, t2) => t1.designation.localeCompare(t2.designation));
    },
    async addTuyauDiametre(tuyauDiametre) {
      const data = await TuyauDiametreService.addTuyauDiametre(tuyauDiametre);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateTuyauDiametre(tuyauDiametre) {
      const data = await TuyauDiametreService.updateTuyauDiametre(tuyauDiametre);
      this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
      return data;
    },
    async removeTuyauDiametre(id) {
      const data = await TuyauDiametreService.removeTuyauDiametre(id);
      this.liste = this.liste.filter((m) => m.id != id);
      return data;
    },
  },
});
