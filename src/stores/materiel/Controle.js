import { defineStore } from "pinia";
import ControleService from "../../services/materiel/ControleService.js";

export const useControleStore = defineStore("controle", {
  state: () => ({
    liste: [],
    statuts: [],
  }),
  actions: {
    async fetchControles() {
      this.liste = await ControleService.getControles();
    },
    async fetchStatuts() {
      this.statuts = await ControleService.getStatuts();
    },
    async addControle(controle) {
      const data = await ControleService.addControle(controle);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateControle(controle) {
      const data = await ControleService.updateControle(controle);
      this.liste = this.liste.map((c) => (c.id === data.id ? data : c));
      return data;
    },
    async removeControle(controleId) {
      const data = await ControleService.removeControle(controleId);
      this.liste = this.liste.filter((c) => c.id !== controleId);
      return data;
    },
  },
});
