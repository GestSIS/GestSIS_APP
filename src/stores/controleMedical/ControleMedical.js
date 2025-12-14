import { defineStore } from 'pinia';
import ControlesMedicauxService from '../../services/ControlesMedicauxService.js';

export const useControleMedicalStore = defineStore('controleMedical', {
    state: () => ({
        liste: [],
        active: {
            id: null,
            data: {},
        },
    }),
    actions: {
        clearCache() {
            this.liste = [];
            this.active.id = null;
            this.active.data = {};
        },
        async fetchControlesMedicaux() {
            this.liste = await ControlesMedicauxService.getControlesMedicaux();
        },
        async fetchControleMedical(id) {
            const data = await ControlesMedicauxService.getControleMedical(id);
            this.active.id = data.id;
            this.active.data = data;
            return data;
        },
        resetControleMedical() {
            this.active.id = null;
            this.active.data = {
                designation: '',
                validite: '',
                sapeur_id: '',
                medecin_id: '',
                consultation: '',
                filename: null,
                accepter: 0,
            };
        },
        async createControleMedical(payload) {
            const data = await ControlesMedicauxService.createControleMedical(
                payload || this.active.data
            );
            this.active.id = data.id;
            this.active.data = data;
            return data;
        },
        async updateControleMedical(payload) {
            const data = await ControlesMedicauxService.updateControleMedical(
                this.active.data.id,
                payload || this.active.data
            );
            this.active.id = data.id;
            this.active.data = data;
            return data;
        },
        async removeControleMedical(controleId) {
            const data = await ControlesMedicauxService.removeControleMedical(controleId);
            this.liste = this.liste.filter((c) => c.id != controleId);
            return data;
        },
        async addJustificatif(justificatif) {
            const data = await ControlesMedicauxService.addJustificatif(
                this.active.id,
                justificatif
            );
            this.active.id = data.id;
            this.active.data = data;
            return data;
        },
        async removeJustificatif(controleMedicalId) {
            const data = await ControlesMedicauxService.removeJustificatif(
                controleMedicalId || this.active.id
            );
            const id = controleMedicalId || this.active.id;
            if (this.active.id == id) {
                this.active.data = {
                    ...this.active.data,
                    filename: null,
                };
            }
            return data;
        },
    },
});
