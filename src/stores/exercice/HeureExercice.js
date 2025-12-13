import { defineStore } from 'pinia';
import ExerciceHeureService from '../../services/ExerciceHeureTypeService.js';

export const useHeureExerciceStore = defineStore('heureExercice', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchHeuresExercice() {
            if (this.liste.length > 0) return;
            this.liste = (await ExerciceHeureService.getHeuresTypes())
                .slice(0)
                .sort((c1, c2) => c1.designation.localeCompare(c2.designation));
        },
        async addExerciceHeure(heure) {
            const data = await ExerciceHeureService.addHeureType(heure);
            this.liste.push(data);
            return data;
        },
        async updateExerciceHeure(heure) {
            const data = await ExerciceHeureService.updateHeureType(heure);
            this.liste = this.liste.map((m) => (m.id === heure.id ? data : m));
            return data;
        },
        async removeExerciceHeure(heureId) {
            const data = await ExerciceHeureService.removeHeureType(heureId);
            this.liste = this.liste.filter((m) => m.id != heureId);
            return data;
        },
    },
});
