import { defineStore } from "pinia";
import EcritureCategorieService from "../../services/EcritureCategorieService.js";

export const useEcritureCategorieStore = defineStore("ecritureCategorie", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchEcritureCategories() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      }
      const data = await EcritureCategorieService.getCategories();
      this.liste = data;
      return data;
    },
    async addEcritureCategorie(categorie) {
      const data = await EcritureCategorieService.addCategorie(categorie);
      this.liste.push(data);
      return data;
    },
    async updateEcritureCategorie(categorie) {
      const data = await EcritureCategorieService.updateCategorie(categorie);
      this.liste = this.liste.map((m) => (m.id === data.id ? data : m));
      return data;
    },
    async removeEcritureCategorie(categorieId) {
      const data = await EcritureCategorieService.removeCategorie(categorieId);
      this.liste = this.liste.filter((m) => m.id != categorieId);
      return data;
    },
  },
});
