import EmplacementService from '../../services/materiel/EmplacementService.js';
import { defineStore } from 'pinia';

export const useEmplacementStore = defineStore('emplacement', {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchEmplacements() {
      this.liste = await EmplacementService.getEmplacements();
    },
    async addEmplacement(emplacement) {
      const data = await EmplacementService.addEmplacement(emplacement);
      this.liste.push(data);
      return data;
    },
    async updateEmplacement(emplacement) {
      const data = await EmplacementService.updateEmplacement(emplacement);
      this.liste = this.liste.map((e) => (e.id === data.id ? data : e));
      return data;
    },
    async removeEmplacement(emplacementId) {
      await EmplacementService.removeEmplacement(emplacementId);
      this.liste = this.liste.filter((e) => e.id !== emplacementId);
    },
  },
});
