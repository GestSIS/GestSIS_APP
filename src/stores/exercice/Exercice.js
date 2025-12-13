import { defineStore } from 'pinia';
import ExerciceService from '../../services/ExerciceService.js';

export const useExerciceStore = defineStore('exercice', {
    state: () => ({
        liste: [],
        absences: [],
        active: {
            id: 0,
            sapeurs: [],
            data: {},
            sms: [],
        },
    }),
    getters: {
        activeExerciceComptableId: (state) => {
            // Ce getter devra être injecté depuis exerciceComptable ou passé en paramètre
            return state.active.data?.exercice_comptable_id;
        },
    },
    actions: {
        async fetchListeExercice(exerciceComptableId) {
            const data = await ExerciceService.getExercices(exerciceComptableId);
            this.liste = data
                .slice(0)
                .sort((e1, e2) => new Date(e2.date) - new Date(e1.date));
        },
        async fetchExerciceAbsences(exerciceComptableId) {
            this.absences = await ExerciceService.getAbsences(exerciceComptableId);
        },
        async fetchExercice(exerciceId) {
            this.active.data = await ExerciceService.getExercice(exerciceId);
        },
        async fetchExerciceSms(exerciceId) {
            this.active.sms = await ExerciceService.getSms(exerciceId);
        },
        async fetchExerciceSapeurs(exerciceId) {
            this.active.sapeurs = await ExerciceService.getSapeurs(exerciceId);
        },
        selectExercice(id) {
            this.active.id = id;
        },
        resetActiveExercice(exerciceComptableId) {
            this.active.id = null;
            this.active.sapeurs = [];
            this.active.data = {
                id: null,
                localite_id: null,
                exercice_categorie_id: null,
                exercice_comptable_id: exerciceComptableId,
                date: null,
                heure: null,
                lieu: '',
                communications: '',
                designation: '',
                duree: null,
                statut: 0,
            };
        },
        async createExercice(exercice) {
            const data = await ExerciceService.createExercice(exercice);
            this.liste.push(data);
            this.active.id = data.id;
            this.active.data = data;
            return data;
        },
        async validerExercice(exerciceId) {
            const data = await ExerciceService.validerExercice(exerciceId);
            this.liste = this.liste.map((e) =>
                e.id == exerciceId ? { ...e, statut: data?.statut } : e
            );
            if (this.active.id == exerciceId) {
                this.active.data.statut = data?.statut;
            }
            return data;
        },
        async annulerExercice(exerciceId) {
            const data = await ExerciceService.cancelExercice(exerciceId);
            this.liste = this.liste.map((e) =>
                e.id == exerciceId ? { ...e, statut: data?.statut } : e
            );
            if (this.active.id == exerciceId) {
                this.active.data.statut = data?.statut;
            }
            return data;
        },
        async reactiverExercice(exerciceId) {
            const data = await ExerciceService.reactivateExercice(exerciceId);
            this.liste = this.liste.map((e) =>
                e.id == exerciceId ? { ...e, statut: data?.statut } : e
            );
            if (this.active.id == exerciceId) {
                this.active.data.statut = data?.statut;
            }
            return data;
        },
        async removeExercice(exerciceId) {
            await ExerciceService.deleteExercice(exerciceId);
            this.liste = this.liste.filter((e) => e.id != exerciceId);
        },
        async saveExercice(exercice) {
            const data = await ExerciceService.saveExercice(exercice.id, exercice);
            this.active.data = data;
            return data;
        },
        async addSapeurs(sapeurs) {
            const data = await ExerciceService.addSapeurs(this.active.data.id, {
                sapeurs,
            });
            this.active.sapeurs = data.sapeurs;
            this.liste = this.liste.map((e) =>
                e.id == this.active.data.id ? { ...e, statut: data.statut } : e
            );
            if (this.active.id == this.active.data.id) {
                this.active.data.statut = data.statut;
            }
            return data;
        },
        async removeSapeurs(sapeurIds) {
            const data = await ExerciceService.removeSapeurs(this.active.data.id, {
                sapeurs: sapeurIds,
            });
            this.active.sapeurs = this.active.sapeurs.filter(
                (p) => !sapeurIds.includes(p.sapeur_id)
            );
            this.liste = this.liste.map((e) =>
                e.id == this.active.data.id ? { ...e, statut: data } : e
            );
            if (this.active.id == this.active.data.id) {
                this.active.data.statut = data;
            }
            return data;
        },
        async addHeure(heure) {
            const data = await ExerciceService.addHeure(heure);
            if (this.active.id == data.exercice_id) {
                this.active.sapeurs = this.active.sapeurs.map((s) =>
                    s.sapeur_id != data.sapeur_id
                        ? s
                        : { ...s, heures: [...(s.heures ?? []), data] }
                );
            }
            return data;
        },
        async editHeure(heure) {
            const data = await ExerciceService.editHeure(heure);
            if (this.active.id == data.exercice_id) {
                this.active.sapeurs = this.active.sapeurs.map((s) =>
                    s.sapeur_id != data.sapeur_id
                        ? s
                        : {
                            ...s,
                            heures: (s.heures ?? []).map((h) =>
                                h.id == data.id ? data : h
                            ),
                        }
                );
            }
            return data;
        },
        async removeHeure(heure) {
            const data = await ExerciceService.removeHeure(heure.id);
            if (this.active.id == heure.exercice_id) {
                this.active.sapeurs = this.active.sapeurs.map((s) =>
                    s.sapeur_id != heure.sapeur_id
                        ? s
                        : {
                            ...s,
                            heures: (s.heures ?? []).filter((h) => h.id != heure.id),
                        }
                );
            }
            return data;
        },
        async editPresenceExercice(presenceId, presence) {
            const { statut, sapeur } = await ExerciceService.editPresence(
                presenceId,
                presence
            );
            if (this.active.id == sapeur.exercice_id) {
                this.active.sapeurs = this.active.sapeurs.map((s) =>
                    s.id == sapeur.id ? sapeur : s
                );
            }
            this.absences = this.absences.map((s) => (s.id == sapeur.id ? sapeur : s));
            this.liste = this.liste.map((e) =>
                e.id == sapeur.exercice_id ? { ...e, statut } : e
            );
            if (this.active.id == sapeur.exercice_id) {
                this.active.data.statut = statut;
            }
            return sapeur;
        },
        async removeExcuse(exerciceId, sapeurId) {
            const data = await ExerciceService.removeExcuse(exerciceId, sapeurId);
            if (this.active.id == data.exercice_id) {
                this.active.sapeurs = this.active.sapeurs.map((s) =>
                    s.id == data.id ? data : s
                );
            }
            this.absences = this.absences.map((s) => (s.id == data.id ? data : s));
            return data;
        },
    },
});
