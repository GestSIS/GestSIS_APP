import { defineStore } from 'pinia';
import ExerciceCategorieService from '../../services/ExerciceCategorieService.js';

export const useExerciceCategorieStore = defineStore('exerciceCategorie', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchExerciceCategories() {
            if (this.liste.length > 0) return;
            this.liste = (await ExerciceCategorieService.getCategories())
                .slice(0)
                .sort((c1, c2) => c1.designation.localeCompare(c2.designation));
        },
        async addExerciceCategorie(categorie) {
            const data = await ExerciceCategorieService.addCategorie(categorie);
            this.liste.push(data);
            return data;
        },
        async updateExerciceCategorie(categorie) {
            const data = await ExerciceCategorieService.updateCategorie(categorie);
            this.liste = this.liste.map((m) => (m.id === categorie.id ? data : m));
            return data;
        },
        async removeExerciceCategorie(categorieId) {
            const data = await ExerciceCategorieService.removeCategorie(categorieId);
            this.liste = this.liste.filter((m) => m.id != categorieId);
            return data;
        },
    },
});
