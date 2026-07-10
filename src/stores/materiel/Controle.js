import { defineStore } from 'pinia';
import ControleService from '../../services/materiel/ControleService.js';

export const useControleStore = defineStore('controle', {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchControles() {
      this.liste = await ControleService.getControles();
    },
    async addControle(controle) {
      const data = await ControleService.addControle(controle);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateControle(controle) {
      const data = await ControleService.updateControle(controle);
      this.liste = [...this.liste.map((c) => (c.id === data.id ? data : c))];
      return data;
    },
    async removeControle(controleId) {
      const data = await ControleService.removeControle(controleId);
      this.liste = this.liste.filter((c) => c.id !== controleId);
      return data;
    },
    async addTache(controleId, tache) {
      const data = await ControleService.addTache(controleId, tache);
      this.liste = this.liste.map((c) => {
        if (c.id === controleId) {
          return { ...c, taches: [...(c.taches || []), data] };
        }
        return c;
      });
      return data;
    },
    async updateTache(controleId, tache) {
      const data = await ControleService.updateTache(controleId, tache);
      this.liste = this.liste.map((c) => {
        if (c.id === controleId) {
          return { ...c, taches: c.taches.map((t) => (t.id === data.id ? data : t)) };
        }
        return c;
      });
      return data;
    },
    async removeTache(controleId, tacheId) {
      const data = await ControleService.removeTache(controleId, tacheId);
      this.liste = this.liste.map((c) => {
        if (c.id === controleId) {
          return { ...c, taches: c.taches.filter((t) => t.id !== tacheId) };
        }
        return c;
      });
      return data;
    },
  },
});
