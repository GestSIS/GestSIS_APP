import { defineStore } from "pinia";
import MaterielService from "../../services/MaterielService.js";

export const useMaterielStore = defineStore("materiel", {
  state: () => ({
    liste: [],
    active: {
      id: null,
      materiel_id: null,
      quantite: 0,
    },
  }),
  actions: {
    async fetchMateriels() {
      this.liste = await MaterielService.getMateriels();
    },
    async addMateriel(materiel) {
      const data = await MaterielService.addMateriel(materiel);
      this.liste.push(data);
      return data;
    },
    async updateMateriel(materiel) {
      const data = await MaterielService.updateMateriel(materiel);
      this.liste = this.liste.map((m) => (m.id === materiel.id ? data : m));
      return data;
    },
    async removeMateriel(materielId) {
      const data = await MaterielService.removeMateriel(materielId);
      this.liste = this.liste.filter((m) => m.id != materielId);
      return data;
    },
  },
});
