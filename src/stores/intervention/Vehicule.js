import { defineStore } from "pinia";
import VehiculeService from "../../services/VehiculeService.js";

export const useVehiculeStore = defineStore("vehicule", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchVehicules() {
      this.liste = await VehiculeService.getVehicules();
    },
  },
});
