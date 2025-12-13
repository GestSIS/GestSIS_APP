import { defineStore } from 'pinia';
import AspsmsParamService from '../../services/AspsmsParamService.js';

export const useAspsmsParamStore = defineStore('aspsmsParam', {
    state: () => ({
        params: null,
        credit: 0,
    }),
    actions: {
        clearCache() {
            this.params = null;
            this.credit = 0;
        },
        updateParams({ username, password, credit }) {
            this.params = { ...this.params, username, password };
            this.credit = credit;
        },
        updateCredit(credit) {
            this.credit = parseFloat(credit);
        },
        async fetchCredit() {
            const data = await AspsmsParamService.getCredit();
            this.updateCredit(data);
            return data;
        },
        async fetchParams() {
            if (this.params === null) {
                const data = await AspsmsParamService.getParams();
                this.updateParams(data);
                return data;
            } else {
                return this.fetchCredit();
            }
        },
        async updateAspsmsParams(params) {
            const data = await AspsmsParamService.updateParams(params);
            this.updateParams({ ...params, credit: data.credit });
            return data;
        },
    },
});
