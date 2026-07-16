import { defineStore } from "pinia";
import SisParamService from "../../services/SisParamService.js";

export const useSisParamStore = defineStore("sisParam", {
  state: () => ({
    params: null,
    contacts: [],
  }),
  actions: {
    clearCache() {
      this.params = null;
      this.contacts = [];
    },
    async fetchParams() {
      if (this.params === null) {
        this.params = await SisParamService.getParams();
        return this.params;
      }
    },
    async updateSisParams(params) {
      this.params = await SisParamService.updateParams(params);
      return this.params;
    },
    async fetchContacts() {
      this.contacts = await SisParamService.getContacts();
      return this.contacts;
    },
    async addSisContact(contact) {
      const data = await SisParamService.addContact(contact);
      this.contacts = [...this.contacts, data];
      return data;
    },
    async removeSisContact(contactId) {
      await SisParamService.removeContact(contactId);
      this.contacts = this.contacts.filter((c) => c.id != contactId);
    },
  },
});
