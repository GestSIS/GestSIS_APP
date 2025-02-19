import EmplacementService from '../../services/materiel/EmplacementService.js';
import { defineStore } from 'pinia';

export const useEmplacementStore = defineStore('emplacement', {
  state: () => ({
    liste: [],
  }),
  actions: {
    fetchEmplacements() {
      return EmplacementService.getEmplacements().then(
        (data) => (this.liste = data)
      );
    },
    addEmplacement(emplacement) {
      return EmplacementService.create(emplacement).then((data) =>
        this.liste.push(data)
      );
    },
    updateEmplacement(emplacement) {
      return EmplacementService.update(emplacement).then(
        (data) =>
          (this.liste = this.liste.map((e) => (e.id === data.id ? data : e)))
      );
    },
    removeEmplacement(emplacementId) {
      return EmplacementService.remove(emplacementId).then(() => {
        this.liste = this.liste.filter((e) => e.id !== emplacementId);
      });
    },
  },
});
