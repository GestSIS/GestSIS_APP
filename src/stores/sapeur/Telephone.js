import { defineStore } from "pinia";
import TelephoneService from "../../services/TelephoneService.js";

export const useTelephoneStore = defineStore("telephone", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchTelephones() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      }
      const data = await TelephoneService.getTelephones();
      this.liste = data;
      return data;
    },
    async addTelephone(telephone) {
      const data = await TelephoneService.addTelephone(telephone);
      this.liste.push(data);
      return data;
    },
    async updateTelephone(telephone) {
      const data = await TelephoneService.updateTelephone(telephone);
      this.liste = this.liste.map((m) => (m.id === data.id ? data : m));
      return data;
    },
    async removeTelephone(telephoneId) {
      const data = await TelephoneService.removeTelephone(telephoneId);
      this.liste = this.liste.filter((m) => m.id != telephoneId);
      return data;
    },
  },
});
