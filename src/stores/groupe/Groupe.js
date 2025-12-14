import { defineStore } from 'pinia';
import GroupeService from '../../services/GroupeService.js';

export const useGroupeStore = defineStore('groupe', {
    state: () => ({
        liste: [],
    }),
    getters: {
        treeGroupesSapeurs: (state) => {
            let insideGroupes = (groupeId) =>
                state.liste
                    .filter((i) => i.parent_id === groupeId)
                    .map((s) => Object.assign({}, s))
                    .map((s) => ({
                        ...s,
                        sapeurs: s.sapeur_ids.map((s) => s.sapeur_id),
                        groupes: insideGroupes(s.id),
                    }));

            return insideGroupes(null);
        },
    },
    actions: {
        async fetchGroupes() {
            const data = await GroupeService.getGroupes();
            this.liste = data;
            this.liste.sort((g1, g2) => g1.tri - g2.tri);
            this.liste = [...this.liste];
            return data;
        },
        async createGroupe(groupeData) {
            const data = await GroupeService.createGroupe(groupeData);
            this.liste = [...this.liste, data];
            this.liste.sort((g1, g2) => g1.tri - g2.tri);
            this.liste = [...this.liste];
            return data;
        },
        async updateGroupe({ groupeId, data: groupeData }) {
            const data = await GroupeService.updateGroupe(groupeId, groupeData);
            this.liste = [
                ...this.liste.map((g) => (g.id === data.id ? data : g)),
            ];
            this.liste.sort((g1, g2) => g1.tri - g2.tri);
            this.liste = [...this.liste];
            return data;
        },
        async deleteGroupe(groupeId) {
            await GroupeService.deleteGroupe(groupeId);
            this.liste = this.liste.filter((g) => g.id != groupeId);
        },
        async updateGroupeSapeurs({ groupeId, sapeurIds }) {
            const data = await GroupeService.updateGroupeSapeurs(groupeId, sapeurIds);
            this.liste = [
                ...this.liste.map((g) =>
                    g.id === groupeId ? { ...g, sapeur_ids: data } : g
                ),
            ];
            return data;
        },
    },
});
