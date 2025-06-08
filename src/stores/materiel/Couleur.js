import CouleurService from '../../services/materiel/CouleurService.js';
import { defineStore } from 'pinia';

export const useCouleurStore = defineStore('couleur', {
  state: () => ({
    liste: [],
  }),
  actions: {
    fetchCouleurs() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      } else {
        return CouleurService.getCouleurs().then(
          (data) =>
            (this.liste = data
              .slice(0)
              .sort((t1, t2) => t1.designation > t2.designation))
        );
      }
    },
    addCouleur(Couleur) {
      return CouleurService.addCouleur(Couleur).then((data) => {
        this.liste = [...this.liste, data];
        return data;
      });
    },
    updateCouleur(Couleur) {
      return CouleurService.updateCouleur(Couleur).then((data) => {
        this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
        return data;
      });
    },
    removeCouleur(CouleurId) {
      return CouleurService.removeCouleur(CouleurId).then((data) => {
        this.liste = this.liste.filter((m) => m.id != CouleurId);
        return data;
      });
    },
  },
});
