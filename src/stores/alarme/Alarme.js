import { defineStore } from "pinia";
import AlarmeService from "../../services/AlarmeService.js";

export const useAlarmeStore = defineStore("alarme", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchListeAlarme() {
      this.liste = await AlarmeService.getAlarmes();
    },
  },
});
