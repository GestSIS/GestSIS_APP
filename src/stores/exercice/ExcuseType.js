import { defineStore } from 'pinia';
import ExcuseTypeService from '../../services/ExcuseTypeService.js';

export const useExcuseTypeStore = defineStore('excuseType', {
    state: () => ({
        liste: [],
        activeExcuseTypeId: null,
    }),
    actions: {
        async fetchExcuseTypes() {
            if (this.liste.length == 0) {
                this.liste = await ExcuseTypeService.getExcuses();
            }
        },
        selectExcuseType(excuseTypeId) {
            this.activeExcuseTypeId = excuseTypeId;
        },
        async addExcuseType(excuse) {
            const data = await ExcuseTypeService.addExcuse(excuse);
            this.liste.push(data);
            return data;
        },
        async updateExcuseType(excuse) {
            const data = await ExcuseTypeService.updateExcuse(excuse);
            this.liste = this.liste.map((m) => (m.id === excuse.id ? data : m));
            return data;
        },
        async removeExcuseType(excuseId) {
            const data = await ExcuseTypeService.removeExcuse(excuseId);
            this.liste = this.liste.filter((m) => m.id != excuseId);
            return data;
        },
    },
});
