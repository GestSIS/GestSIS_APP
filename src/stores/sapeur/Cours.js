import { defineStore } from 'pinia';
import CoursService from '../../services/CoursService.js';

export const useCoursStore = defineStore('cours', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchCours() {
            const data = await CoursService.getCours();
            this.liste = data.sort((c1, c2) => c2.tri - c1.tri);
            return data;
        },
        async addCours(cours) {
            const data = await CoursService.addCours(cours);
            this.liste = [...this.liste, data].sort((c1, c2) => c2.tri - c1.tri);
            return data;
        },
        async updateCours(cours) {
            const data = await CoursService.updateCours(cours);
            this.liste = [
                ...this.liste.map((m) => (m.id === data.id ? data : m)),
            ].sort((c1, c2) => c2.tri - c1.tri);
            return data;
        },
        async removeCours(coursId) {
            const data = await CoursService.removeCours(coursId);
            this.liste = this.liste.filter((m) => m.id != coursId);
            return data;
        },
    },
});
