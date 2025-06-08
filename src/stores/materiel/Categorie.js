import MaterielCategorieService from '../../services/materiel/CategorieService.js';
import { defineStore } from 'pinia';

export const useMaterielCategorieStore = defineStore('materielCategorie', {
  state: () => ({
    liste: [],
  }),
  actions: {
    fetchMaterielCategories() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      } else {
        return MaterielCategorieService.getCategories().then(
          (data) =>
          (this.liste = data
            .slice(0)
            .sort((t1, t2) => t1.designation > t2.designation))
        );
      }
    },
    addMaterielCategorie(categorie) {
      return MaterielCategorieService.addCategorie(categorie).then((data) => {
        this.liste = [...this.liste, data];
        return data;
      });
    },
    updateMaterielCategorie(categorie) {
      return MaterielCategorieService.updateCategorie(categorie).then(
        (data) => {
          this.liste = [
            ...this.liste.map((m) => (m.id === data.id ? data : m)),
          ];
          return data;
        }
      );
    },
    removeMaterielCategorie(categorieId) {
      return MaterielCategorieService.removeCategorie(categorieId).then(
        (data) => {
          this.liste = this.liste.filter((m) => m.id != categorieId);
          return data;
        }
      );
    },
  },
});
