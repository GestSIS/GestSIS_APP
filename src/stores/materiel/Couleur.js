import CouleurService from '../../services/materiel/CouleurService.js';
import { defineStore } from 'pinia';

export const useCouleurStore = defineStore('couleur', {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchCouleurs() {
      if (this.liste.length > 0) {
        return;
      }
      const data = await CouleurService.getCouleurs();
      this.liste = data.slice(0).sort((t1, t2) => t1.nom.localeCompare(t2.nom));
    },
    async addCouleur(Couleur) {
      const data = await CouleurService.addCouleur(Couleur);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateCouleur(Couleur) {
      const data = await CouleurService.updateCouleur(Couleur);
      this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
      return data;
    },
    async removeCouleur(CouleurId) {
      const data = await CouleurService.removeCouleur(CouleurId);
      this.liste = this.liste.filter((m) => m.id != CouleurId);
      return data;
    },
  },
});
