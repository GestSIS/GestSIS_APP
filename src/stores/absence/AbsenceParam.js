import { defineStore } from "pinia";
import AbsenceParamService from "../../services/AbsenceParamService.js";

export const useAbsenceParamStore = defineStore("absenceParam", {
  state: () => ({
    params: null,
  }),
  actions: {
    clearCache() {
      this.params = null;
    },
    async fetchParams() {
      if (this.params === null) {
        this.params = await AbsenceParamService.getParams();
        return this.params;
      }
    },
    async updateAbsenceParams(params) {
      this.params = await AbsenceParamService.updateParams(params);
      return this.params;
    },
  },
});
