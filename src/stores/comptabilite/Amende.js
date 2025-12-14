import { defineStore } from 'pinia';
import AmendeService from '../../services/AmendeService.js';

export const useAmendeStore = defineStore('amende', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchAmendes() {
            if (this.liste.length > 0) {
                return Promise.resolve();
            }
            const data = await AmendeService.getAmendes();
            this.liste = data;
            return data;
        },
        async updateAmendes(amendes) {
            const data = await AmendeService.updateAmendes(amendes);
            this.liste = data;
            return data;
        },
    },
});