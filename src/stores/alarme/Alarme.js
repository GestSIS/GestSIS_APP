import { defineStore } from "pinia";
import AlarmeService from "../../services/AlarmeService.js";

export const useAlarmeStore = defineStore("alarme", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchAlarmes() {
      this.liste = await AlarmeService.getAlarmes();
    },
  },
});
