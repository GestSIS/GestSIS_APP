import { defineStore } from "pinia";
import SmsService from "../../services/SmsService.js";

export const useSmsStore = defineStore("sms", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchSms(exerciceComptableId) {
      const data = await SmsService.getSms(exerciceComptableId);
      this.liste = data;
      return data;
    },
  },
});
