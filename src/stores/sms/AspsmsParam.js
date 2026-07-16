import { defineStore } from "pinia";
import AspsmsParamService from "../../services/AspsmsParamService.js";

export const useAspsmsParamStore = defineStore("aspsmsParam", {
  state: () => ({
    params: null,
    credit: 0,
  }),
  actions: {
    clearCache() {
      this.params = null;
      this.credit = 0;
    },
    async fetchCredit() {
      const data = await AspsmsParamService.getCredit();
      this.credit = parseFloat(data);
      return data;
    },
    async fetchParams() {
      if (this.params === null) {
        const data = await AspsmsParamService.getParams();
        this.params = { ...this.params, username: data.username, password: data.password };
        this.credit = data.credit;
        return data;
      } else {
        return this.fetchCredit();
      }
    },
    async updateAspsmsParams(params) {
      const data = await AspsmsParamService.updateParams(params);
      this.params = { ...this.params, username: params.username, password: params.password };
      this.credit = data.credit;
      return data;
    },
  },
});
