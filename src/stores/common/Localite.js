import { defineStore } from "pinia";
import LocaliteService from "../../services/LocaliteService.js";

export const useLocaliteStore = defineStore("localite", {
  state: () => ({
    liste: [],
    listeSis: [],
  }),
  getters: {
    listeLocalitesSis: (state) => {
      const index = new Set(state.listeSis);
      return state.liste.filter((l) => index.has(l.id));
    },
  },
  actions: {
    async fetchLocalites() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      }
      const data = await LocaliteService.getLocalites();
      this.liste = data.sort((a, b) => a.designation.localeCompare(b.designation));
    },
    async fetchLocalitesSis() {
      const data = await LocaliteService.getLocalitesSis();
      this.listeSis = data;
    },
    async addLocalitesSis(localiteIds) {
      const data = await LocaliteService.addLocalitesSis(localiteIds);
      this.listeSis = data;
    },
    async removeLocalitesSis(localiteIds) {
      const data = await LocaliteService.removeLocalitesSis(localiteIds);
      this.listeSis = data;
    },
  },
});
