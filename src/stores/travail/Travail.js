import { defineStore } from 'pinia';
import TravailService from '../../services/TravailService.js';

export const useTravailStore = defineStore('travail', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchTravaux(exerciceComptableId) {
            const data = await TravailService.getTravaux(exerciceComptableId);
            this.liste = data.sort((t1, t2) => t1.date > t2.date);
            return data;
        },
        async addTravaux(travaux) {
            const data = await TravailService.addTravaux(travaux);
            data?.forEach((travail) => {
                this.liste = [...this.liste, travail];
            });
            return data;
        },
        async updateTravail(type) {
            const data = await TravailService.updateTravail(type);
            this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
            return data;
        },
        async reviewTravail(travail) {
            const data = await TravailService.reviewTravail(travail);
            this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
            return data;
        },
        async cancelReviewTravail(travailId) {
            const data = await TravailService.cancelReviewTravail(travailId);
            this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
            return data;
        },
        async removeTravail(travailId) {
            const data = await TravailService.removeTravail(travailId);
            this.liste = this.liste.filter((m) => m.id != travailId);
            return data;
        },
    },
});
