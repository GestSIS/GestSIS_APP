import { defineStore } from 'pinia';
import RtaService from '../../services/RtaService.js';

export const useRtaStore = defineStore('rta', {
    state: () => ({
        reference: [],
        actuel: [],
    }),
    actions: {
        async fetchReferenceRta() {
            const data = await RtaService.getReferenceRta();
            this.reference = data.map((s) => ({
                ...s,
                nom_prenom: `${s.nom} ${s.prenom}`,
            }));
            return data;
        },
        async fetchReferenceGestSis() {
            const data = await RtaService.getReferenceGestSis();
            this.actuel = data.map((s) => ({
                ...s,
                nom_prenom: `${s.nom} ${s.prenom}`,
            }));
            return data;
        },
        async updateReferenceRta(payload) {
            const data = await RtaService.updateReference(payload);
            this.reference = data.map((s) => ({
                ...s,
                nom_prenom: `${s.nom} ${s.prenom}`,
            }));
            return data;
        },
    },
});
