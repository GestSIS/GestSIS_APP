import { defineStore } from 'pinia';
import PhaseTypeService from '../../services/PhaseTypeService.js';

export const usePhaseTypeStore = defineStore('phaseType', {
    state: () => ({
        liste: [],
    }),
    actions: {
        async fetchPhaseTypes() {
            this.liste = await PhaseTypeService.getPhases();
        },
    },
});
