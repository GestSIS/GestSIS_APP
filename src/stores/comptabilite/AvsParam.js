import { defineStore } from "pinia";
import AvsParamService from "../../services/AvsParamService.js";

export const useAvsParamStore = defineStore("avsParam", {
  state: () => ({
    params: null,
  }),
  actions: {
    clearCache() {
      this.params = null;
    },
    async fetchParams() {
      if (this.params === null) {
        this.params = await AvsParamService.getParams();
        return this.params;
      }
    },
    async updateAvsParams(params) {
      this.params = await AvsParamService.updateParams(params);
      return this.params;
    },
  },
});
