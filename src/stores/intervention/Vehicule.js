import { defineStore } from 'pinia';
import VehiculeService from '../../services/VehiculeService.js';

export const useVehiculeStore = defineStore('vehicule', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchVehicules() {
            this.liste = await VehiculeService.getVehicules();
        },
        async addVehicule(vehicule) {
            const data = await VehiculeService.addVehicule(vehicule);
            this.liste.push(data);
            return data;
        },
        async updateVehicule(vehicule) {
            const data = await VehiculeService.updateVehicule(vehicule);
            this.liste = this.liste.map((m) => (m.id === vehicule.id ? data : m));
            return data;
        },
        async removeVehicule(vehiculeId) {
            const data = await VehiculeService.removeVehicule(vehiculeId);
            this.liste = this.liste.filter((m) => m.id != vehiculeId);
            return data;
        },
    },
});
