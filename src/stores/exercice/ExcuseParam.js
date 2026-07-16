import { defineStore } from "pinia";
import ExcuseParamService from "../../services/ExcuseParamService.js";

export const useExcuseParamStore = defineStore("excuseParam", {
  state: () => ({
    params: null,
  }),
  actions: {
    clearCache() {
      this.params = null;
    },
    async fetchParams() {
      if (this.params === null) {
        this.params = await ExcuseParamService.getParams();
        return this.params;
      }
    },
    async updateExcuseParams(params) {
      this.params = await ExcuseParamService.updateParams(params);
      return this.params;
    },
  },
});
