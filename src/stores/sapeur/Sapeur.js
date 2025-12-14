import { defineStore } from 'pinia';
import SapeurService from '../../services/SapeurService.js';

export const useSapeurStore = defineStore('sapeur', {
    state: () => ({
        liste: [],
        active: {
            id: 0,
            data: {},
            cours: [],
            permis: [],
            grades: [],
            groupes: [],
            fonctions: [],
            mutations: [],
            exercices: [],
            controles: [],
            telephones: [],
            materiels: [],
        },
    }),
    actions: {
        selectSapeur(sapeurId) {
            this.active.id = sapeurId;
        },
        async fetchListeSapeur() {
            const data = await SapeurService.getSapeurs();
            this.liste = data;
            return data;
        },
        async fetchSapeur(sapeurId) {
            const data = await SapeurService.getData(sapeurId);
            this.active.data = data;
            this.liste.map((s) =>
                s.id == data.id
                    ? {
                        ...s,
                        fonction_id: data.fonction_id,
                        nom: data.nom,
                        prenom: data.prenom,
                        nom_prenom: data.nom_prenom,
                        actif: data.actif,
                        date_naissance: data.date_naissance,
                    }
                    : s
            );
            return data;
        },
        async fetchSapeurPermis(sapeurId) {
            const data = await SapeurService.getPermis(sapeurId);
            this.active.permis = data;
            return data;
        },
        async fetchSapeurTelephones(sapeurId) {
            const data = await SapeurService.getTelephones(sapeurId);
            this.active.telephones = data;
            return data;
        },
        async fetchSapeurGrades(sapeurId) {
            const data = await SapeurService.getGrades(sapeurId);
            this.active.grades = data;
            return data;
        },
        async fetchSapeurFonctions(sapeurId) {
            const data = await SapeurService.getFonctions(sapeurId);
            this.active.fonctions = data;
            return data;
        },
        async fetchSapeurCours(sapeurId) {
            const data = await SapeurService.getCours(sapeurId);
            this.active.cours = data;
            return data;
        },
        async fetchSapeurControlesMedicaux(sapeurId) {
            const data = await SapeurService.getControlesMedicaux(sapeurId);
            this.active.controles = data;
            return data;
        },
        async fetchSapeurMutations(sapeurId) {
            const data = await SapeurService.getMutations(sapeurId);
            this.active.mutations = data;
            return data;
        },
        async fetchSapeurGroupes(sapeurId) {
            const data = await SapeurService.getGroupes(sapeurId);
            this.active.groupes = data;
            return data;
        },
        async fetchSapeurExercices({ sapeurId, exerciceComptableId }) {
            const data = await SapeurService.getExercices(
                sapeurId,
                exerciceComptableId
            );
            this.active.exercices = data;
            return data;
        },
        async createSapeur(payload) {
            const data = await SapeurService.createSapeur(payload);
            this.liste = [
                ...this.liste,
                data,
            ].sort((s1, s2) => s1.nom_prenom.localeCompare(s2.nom_prenom));
            return data;
        },
        async deleteSapeur(sapeurId) {
            const data = await SapeurService.deleteSapeur(sapeurId);
            this.liste = this.liste.filter((s) => s.id != sapeurId);
            return data;
        },
        async saveActiveSapeur(payload) {
            const data = await SapeurService.saveSapeur(
                this.active.data.id,
                payload || this.active.data
            );
            this.active.data = data;
            this.liste.map((s) =>
                s.id == data.id
                    ? {
                        ...s,
                        fonction_id: data.fonction_id,
                        nom: data.nom,
                        prenom: data.prenom,
                        nom_prenom: data.nom_prenom,
                        actif: data.actif,
                        date_naissance: data.date_naissance,
                    }
                    : s
            );
            return data;
        },
        async saveNonSapeurStatut(payload) {
            const data = await SapeurService.saveNonSapeurStatut(
                this.active.data.id,
                payload || this.active.data
            );
            this.active.data = data;
            this.liste.map((s) =>
                s.id == data.id
                    ? {
                        ...s,
                        fonction_id: data.fonction_id,
                        nom: data.nom,
                        prenom: data.prenom,
                        nom_prenom: data.nom_prenom,
                        actif: data.actif,
                        date_naissance: data.date_naissance,
                    }
                    : s
            );
            return data;
        },
        // Téléphones
        async addTelephoneSapeur(telephone) {
            const data = await SapeurService.addTelephone(this.active.id, telephone);
            this.active.telephones = [...this.active.telephones, data];
            return data;
        },
        async editTelephoneSapeur(telephone) {
            const data = await SapeurService.editTelephone(this.active.id, telephone);
            this.active.telephones = [
                ...this.active.telephones.filter((p) => p.id !== data.id),
                data,
            ];
            return data;
        },
        async removeTelephoneSapeur(telephoneId) {
            const data = await SapeurService.removeTelephone(
                this.active.id,
                telephoneId
            );
            this.active.telephones = this.active.telephones.filter(
                (p) => p.id !== telephoneId
            );
            return data;
        },
        // Permis
        async addPermis(payload) {
            const data = await SapeurService.addPermis(this.active.id, payload);
            this.active.permis = [...this.active.permis, data];
            return data;
        },
        async editPermis(payload) {
            const data = await SapeurService.editPermis(this.active.id, payload);
            this.active.permis = [
                ...this.active.permis.filter((p) => p.id !== data.id),
                data,
            ];
            return data;
        },
        async removePermis(payload) {
            const data = await SapeurService.removePermis(this.active.id, payload);
            this.active.permis = this.active.permis.filter((p) => p.id !== payload);
            return data;
        },
        // Fonctions
        async addSapeurFonction(payload) {
            const data = await SapeurService.addFonction(this.active.id, payload);
            this.active.fonctions = [...this.active.fonctions, data.fonction];
            this.active.data.fonction_id = data.main_fonction_id;
            return data;
        },
        async editSapeurFonction(payload) {
            const data = await SapeurService.editFonction(this.active.id, payload);
            this.active.fonctions = [
                ...this.active.fonctions.filter((p) => p.id !== data.fonction.id),
                data.fonction,
            ];
            this.active.data.fonction_id = data.main_fonction_id;
            return data;
        },
        async removeSapeurFonction(fonctionId) {
            const data = await SapeurService.removeFonction(
                this.active.id,
                fonctionId
            );
            this.active.fonctions = this.active.fonctions.filter(
                (p) => p.id !== fonctionId
            );
            this.active.data.fonction_id = data.main_fonction_id;
            return data;
        },
        // Grades
        async addSapeurGrade(payload) {
            const data = await SapeurService.addGrade(this.active.data.id, payload);
            this.active.grades = [...this.active.grades, data.grade];
            this.active.data.grade_id = data.main_grade_id;
            return data;
        },
        async editSapeurGrade(payload) {
            const data = await SapeurService.editGrade(this.active.data.id, payload);
            this.active.grades = [
                ...this.active.grades.filter((p) => p.id !== data.grade.id),
                data.grade,
            ];
            this.active.data.grade_id = data.main_grade_id;
            return data;
        },
        async removeSapeurGrade(gradeId) {
            const data = await SapeurService.removeGrade(
                this.active.data.id,
                gradeId
            );
            this.active.grades = this.active.grades.filter((p) => p.id !== gradeId);
            this.active.data.grade_id = data.main_grade_id;
            return data;
        },
        // Cours
        async addSapeurCours(payload) {
            const data = await SapeurService.addCours(this.active.data.id, payload);
            this.active.cours = [...this.active.cours, data.cours];
            this.active.data.fonction_id = data.main_fonction_id;
            this.active.data.grade_id = data.main_grade_id;
            return data;
        },
        async editSapeurCours(payload) {
            const data = await SapeurService.editCours(this.active.data.id, payload);
            this.active.cours = [
                ...this.active.cours.filter((c) => c.id !== data.id),
                data,
            ];
            return data;
        },
        async removeSapeurCours(coursId) {
            const data = await SapeurService.removeCours(
                this.active.data.id,
                coursId
            );
            this.active.cours = this.active.cours.filter((c) => c.id !== coursId);
            return data;
        },
        // Mutations
        async addMutation(payload) {
            const data = await SapeurService.addMutation(
                this.active.data.id,
                payload
            );
            this.active.mutations = [...this.active.mutations, data.mutation];
            this.liste = this.liste.map((s) => {
                if (s.id === data.mutation.sapeur_id) {
                    return { ...s, actif: data.actif, annee_incorporation: data.annee_incorporation };
                }
                return s;
            });
            return data;
        },
        async editMutation(payload) {
            const data = await SapeurService.editMutation(
                this.active.data.id,
                payload
            );
            this.active.mutations = [
                ...this.active.mutations.filter((c) => c.id !== data.mutation.id),
                data.mutation,
            ];
            this.liste = this.liste.map((s) => {
                if (s.id == data.mutation.sapeur_id) {
                    return { ...s, actif: data.actif, annee_incorporation: data.annee_incorporation };
                }
                return s;
            });
            return data;
        },
        async removeMutation(mutationId) {
            const data = await SapeurService.removeMutation(
                this.active.data.id,
                mutationId
            );
            this.active.mutations = this.active.mutations.filter(
                (c) => c.id !== mutationId
            );
            this.liste = this.liste.map((s) => {
                if (s.id == this.active.data.id) {
                    return { ...s, actif: data.actif };
                }
                return s;
            });
            return data;
        },
        // Autres actions
        async finFonctions(payload) {
            const data = await SapeurService.finFonctions(
                this.active.data.id,
                payload.fin,
                payload.ids
            );
            this.active.fonctions = data;
            return data;
        },
        async quitterGroupes(payload) {
            const data = await SapeurService.quitterGroupes(
                this.active.data.id,
                payload
            );
            this.active.groupes = payload;
            return data;
        },
        async supprimerConvocation(payload) {
            return await SapeurService.supprimerConvocation(
                this.active.data.id,
                payload
            );
        },
        // Matériel
        updateMatPersoListe(materiels) {
            const indexedMat = materiels.reduce((acc, m) => {
                acc[m.id] = m;
                return acc;
            }, {});
            this.active.materiels = this.active.materiels
                .map((m) => indexedMat[m.id])
                .filter((m) => m?.id);
        },
        removeMatPerso(ids) {
            const idsSet = new Set(ids);
            this.active.materiels = this.active.materiels.filter(
                (m) => !idsSet.has(m.id)
            );
        },
        updateExercicePresence(presence) {
            this.active.exercices = this.active.exercices.map((s) =>
                s?.presence?.id == presence?.id ? { ...s, presence } : s
            );
        },
    },
});
