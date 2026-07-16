import MaterielCategorieService from "../../services/materiel/CategorieService.js";
import { defineStore } from "pinia";

export const useMaterielCategorieStore = defineStore("materielCategorie", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchMaterielCategories() {
      if (this.liste.length > 0) {
        return;
      }
      const data = await MaterielCategorieService.getCategories();
      this.liste = data.slice(0).sort((t1, t2) => t1.designation.localeCompare(t2.designation));
    },
    async addMaterielCategorie(categorie) {
      const data = await MaterielCategorieService.addCategorie(categorie);
      this.liste = [...this.liste, data];
      return data;
    },
    async updateMaterielCategorie(categorie) {
      const data = await MaterielCategorieService.updateCategorie(categorie);
      this.liste = this.liste.map((m) => (m.id === data.id ? data : m));
      return data;
    },
    async removeMaterielCategorie(categorieId) {
      const data = await MaterielCategorieService.removeCategorie(categorieId);
      this.liste = this.liste.filter((m) => m.id != categorieId);
      return data;
    },
  },
});
