import { defineStore } from "pinia";
import ConvocationParamService from "../../services/ConvocationParamService.js";

export const useConvocationParamStore = defineStore("convocationParam", {
  state: () => ({
    params: null,
  }),
  actions: {
    clearCache() {
      this.params = null;
    },
    async fetchParams() {
      if (this.params === null) {
        this.params = await ConvocationParamService.getParams();
        return this.params;
      }
      return Promise.resolve(true);
    },
    async updateConvocationParams(params) {
      this.params = await ConvocationParamService.updateParams(params);
      return this.params;
    },
  },
});
