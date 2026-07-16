import { defineStore } from "pinia";
import BaseDataService from "../../services/BaseDataService.js";

export const useBaseDataStore = defineStore("baseData", {
  state: () => ({
    permisTypes: [],
    civilites: [],
    telephoneTypes: [],
  }),
  actions: {
    async fetchPermisType() {
      if (this.permisTypes.length) {
        return Promise.resolve();
      }
      const data = await BaseDataService.getPermisType();
      this.permisTypes = data;
    },
    async fetchCivilites() {
      if (this.civilites.length) {
        return Promise.resolve();
      }
      const data = await BaseDataService.getCivilites();
      this.civilites = data;
    },
    async fetchTelephoneTypes() {
      if (this.telephoneTypes.length) {
        return Promise.resolve();
      }
      const data = await BaseDataService.getTelephones();
      this.telephoneTypes = data;
    },
  },
});
