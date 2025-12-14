import { defineStore } from 'pinia';
import FonctionService from '../../services/FonctionService.js';

export const useFonctionStore = defineStore('fonction', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchFonctions() {
            if (this.liste.length > 0) {
                return Promise.resolve();
            }
            const data = await FonctionService.getFonctions();
            this.liste = data.sort((a, b) => b.tri - a.tri);
            return data;
        },
        async addFonction(fonction) {
            const data = await FonctionService.addFonction(fonction);
            this.liste.push(data);
            return data;
        },
        async updateFonction(fonction) {
            const data = await FonctionService.updateFonction(fonction);
            this.liste = this.liste.map((m) => (m.id === data.id ? data : m));
            return data;
        },
        async removeFonction(fonctionId) {
            const data = await FonctionService.removeFonction(fonctionId);
            this.liste = this.liste.filter((m) => m.id != fonctionId);
            return data;
        },
    },
});
