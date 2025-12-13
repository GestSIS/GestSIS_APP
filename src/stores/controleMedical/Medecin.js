import { defineStore } from 'pinia';
import MedecinService from '../../services/MedecinService.js';

export const useMedecinStore = defineStore('medecin', {
    state: () => ({
        liste: [],
    }),
    actions: {
        clearCache() {
            this.liste = [];
        },
        async fetchMedecins() {
            if (this.liste.length > 0) {
                return;
            }
            this.liste = await MedecinService.getMedecins();
        },
        async addMedecin(medecin) {
            const data = await MedecinService.addMedecin(medecin);
            this.liste = [...this.liste, data];
            return data;
        },
        async updateMedecin(medecin) {
            const data = await MedecinService.updateMedecin(medecin);
            this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
            return data;
        },
        async removeMedecin(medecinId) {
            const data = await MedecinService.removeMedecin(medecinId);
            this.liste = this.liste.filter((m) => m.id != medecinId);
            return data;
        },
    },
});
