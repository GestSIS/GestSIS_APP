import { defineStore } from "pinia";
import AspsmsParamService from "../../services/AspsmsParamService.js";

export const useAspsmsParamStore = defineStore("aspsmsParam", {
  state: () => ({
    params: null,
    credit: 0,
    creditError: null,
  }),
  actions: {
    clearCache() {
      this.params = null;
      this.credit = 0;
      this.creditError = null;
    },
    async fetchCredit() {
      const data = await AspsmsParamService.getCredit();
      this.credit = parseFloat(data);
      return data;
    },
    // Toujours rechargés : renvoient aussi le crédit, sans échouer si le compte ASPSMS est invalide
    // (contrairement à /aspsms/credit), pour pouvoir ouvrir les paramètres et le corriger.
    async fetchParams() {
      const data = await AspsmsParamService.getParams();
      this.params = { ...this.params, username: data.username, password: data.password };
      this.credit = data.credit;
      this.creditError = data.credit_error ?? null;
      return data;
    },
    async updateAspsmsParams(params) {
      const data = await AspsmsParamService.updateParams(params);
      this.params = { ...this.params, username: params.username, password: params.password };
      this.credit = data.credit;
      this.creditError = null;
      return data;
    },
  },
});
