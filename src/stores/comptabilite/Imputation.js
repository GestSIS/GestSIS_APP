import { defineStore } from 'pinia';
import ImputationService from '../../services/ImputationService.js';

export const useImputationStore = defineStore('imputation', {
    state: () => ({
        fraisIndemnites: {
            annuels: [],
            cours: [],
            exercices: [],
            interventions: [],
        },
        ecritures: {
            annuels: [],
            amendes: [],
            divers: [],
        },
        active: {
            ecritures: [],
        },
    }),
    actions: {
        async addEcriture(ecriture) {
            const data = await ImputationService.addEcriture(ecriture);
            if (data.module == 0) {
                this.ecritures.divers.push(data);
            }
            return data;
        },
        async updateEcriture(ecriture) {
            const data = await ImputationService.updateEcriture(ecriture);
            if (data.module == 0) {
                this.ecritures.divers = this.ecritures.divers.map((e) =>
                    e.id == data.id ? data : e
                );
            }
            return data;
        },
        async removeEcriture(ecritureId) {
            const data = await ImputationService.removeEcriture(ecritureId);
            this.ecritures.divers = this.ecritures.divers.filter(
                (e) => e.id != ecritureId
            );
            this.ecritures.amendes = this.ecritures.amendes.filter(
                (e) => e.id != ecritureId
            );
            this.ecritures.annuels = this.ecritures.annuels.filter(
                (e) => e.id != ecritureId
            );
            return data;
        },
        async fetchEcritureComptes({ exerciceComptableId, compteId }) {
            const data = await ImputationService.getEcritureForCompte(
                compteId ?? this.active.compteId,
                exerciceComptableId
            );
            this.active.ecritures = data;
            return data;
        },
        async fetchFraisIndemnitesTypes() {
            const data = await ImputationService.getFraisIndemniteTypes();
            this.fraisIndemnites = {
                ...this.fraisIndemnites,
                ...data,
            };
            return data;
        },
        async fetchEcrituresAnnuels(exerciceComptableId) {
            const data = await ImputationService.getEcrituresAnnuelsForExerciceComptable(
                exerciceComptableId
            );
            this.ecritures.annuels = [...data];
            return data;
        },
        async fetchEcrituresDivers(exerciceComptableId) {
            const data = await ImputationService.getEcrituresDiversForExerciceComptable(
                exerciceComptableId
            );
            this.ecritures.divers = data;
            return data;
        },
        async fetchAmendesExerciceComptable(exerciceComptableId) {
            const data = await ImputationService.getAmendesForExerciceComptable(
                exerciceComptableId
            );
            this.ecritures.amendes = data;
            return data;
        },
        async imputerCours(payload) {
            const data = await ImputationService.imputerCours(payload.id, payload);
            // Note: Cette action met à jour le store cours, pas imputation
            // Il faudra importer useCoursStore dans le composant qui l'utilise
            return data;
        },
        async annulerImputationCours(coursSapeurId) {
            const data = await ImputationService.annulerImputationCours(coursSapeurId);
            // Note: Cette action met à jour le store cours, pas imputation
            return data;
        },
        async imputerExercice(payload) {
            const data = await ImputationService.imputerExercice(
                payload.exercice_id,
                payload
            );
            // Note: Cette action met à jour le store exercice, pas imputation
            return data;
        },
        async annulerImputationExercice(exerciceId) {
            const data = await ImputationService.annulerImputationExercice(exerciceId);
            // Note: Cette action met à jour le store exercice, pas imputation
            return data;
        },
        async imputerTravail(ids) {
            const data = await ImputationService.imputerTravail(ids);
            return data;
        },
        async annulerImputationTravail(travailId) {
            const data = await ImputationService.annulerImputationTravail(travailId);
            // Note: Cette action met à jour le store travail, pas imputation
            return data;
        },
        async imputerIntervention(payload) {
            const data = await ImputationService.imputerIntervention(
                payload.intervention_id,
                payload
            );
            // Note: Cette action met à jour le store intervention, pas imputation
            return data;
        },
        async annulerImputationIntervention(interventionId) {
            const data = await ImputationService.annulerImputationIntervention(
                interventionId
            );
            // Note: Cette action met à jour le store intervention, pas imputation
            return data;
        },
        async imputerAnnuel(exerciceComptableId) {
            const data = await ImputationService.imputerAnnuel(exerciceComptableId);
            this.ecritures.annuels = data;
            return data;
        },
        async annulerImputationAnnuel(exerciceComptableId) {
            await ImputationService.annulerImputationAnnuel(exerciceComptableId);
            this.ecritures.annuels = [];
        },
        async genererAmendesAnnuels(exerciceComptableId) {
            const data = await ImputationService.genererAmendesAnnuels(exerciceComptableId);
            this.ecritures.amendes = data;
            return data;
        },
        async genererAmendesPourSapeur({ exerciceComptableId, sapeurId, tarifs }) {
            const data = await ImputationService.genererAmendesAnnuels(
                exerciceComptableId,
                sapeurId,
                tarifs
            );
            //TODO: Mise à jour du state si nécessaire
            return data;
        },
        async addFraisIndemniteAnnuel(frais) {
            const data = await ImputationService.addFraisIndemniteAnnuel(frais);
            this.fraisIndemnites.annuels = this.fraisIndemnites.annuels.map((f) => {
                if (f.id === data.frais_indemnite_annuel_type_id) {
                    return {
                        ...f,
                        frais_indemnite_annuels: [
                            ...f.frais_indemnite_annuels,
                            data,
                        ],
                    };
                } else {
                    return f;
                }
            });
            return data;
        },
        async updateFraisIndemniteAnnuel(frais) {
            const data = await ImputationService.updateFraisIndemniteAnnuel(frais);
            this.fraisIndemnites.annuels = this.fraisIndemnites.annuels.map((f) => {
                if (f.id === data.frais_indemnite_annuel_type_id) {
                    return {
                        ...f,
                        frais_indemnite_annuels: [
                            ...f.frais_indemnite_annuels.filter(
                                (e) => e.id != data.id
                            ),
                            data,
                        ],
                    };
                } else {
                    return f;
                }
            });
            return data;
        },
        async removeFraisIndemniteAnnuel(frais) {
            const data = await ImputationService.removeFraisIndemniteAnnuel(frais);
            this.fraisIndemnites.annuels = this.fraisIndemnites.annuels.map((f) => {
                return {
                    ...f,
                    frais_indemnite_annuels: f.frais_indemnite_annuels.filter(
                        (e) => e.id != frais
                    ),
                };
            });
            return data;
        },
        async addFraisIndemniteAnnuelType(frais) {
            const data = await ImputationService.addFraisIndemniteAnnuelType(frais);
            this.fraisIndemnites.annuels.push(data);
            return data;
        },
        async updateFraisIndemniteAnnuelType(frais) {
            const data = await ImputationService.updateFraisIndemniteAnnuelType(frais);
            this.fraisIndemnites.annuels = this.fraisIndemnites.annuels.map((m) =>
                m.id === data.id ? { ...m, ...data } : m
            );
            return data;
        },
        async removeFraisIndemniteAnnuelType(frais) {
            const data = await ImputationService.removeFraisIndemniteAnnuelType(frais);
            this.fraisIndemnites.annuels = this.fraisIndemnites.annuels.filter(
                (m) => m.id != frais
            );
            return data;
        },
        async addIndemniteCours(indemnite) {
            const data = await ImputationService.addIndemniteCours(indemnite);
            this.fraisIndemnites.cours.push(data);
            return data;
        },
        async updateIndemniteCours(indemnite) {
            const data = await ImputationService.updateIndemniteCours(indemnite);
            this.fraisIndemnites.cours = this.fraisIndemnites.cours.map((m) =>
                m.id === data.id ? data : m
            );
            return data;
        },
        async removeIndemniteCours(indemniteId) {
            const data = await ImputationService.removeIndemniteCours(indemniteId);
            this.fraisIndemnites.cours = this.fraisIndemnites.cours.filter(
                (m) => m.id != indemniteId
            );
            return data;
        },
        async addIndemniteExercice(indemnite) {
            const data = await ImputationService.addIndemniteExercice(indemnite);
            this.fraisIndemnites.exercices.push(data);
            return data;
        },
        async updateIndemniteExercice(indemnite) {
            const data = await ImputationService.updateIndemniteExercice(indemnite);
            this.fraisIndemnites.exercices = this.fraisIndemnites.exercices.map((m) =>
                m.id === data.id ? data : m
            );
            return data;
        },
        async removeIndemniteExercice(indemniteId) {
            const data = await ImputationService.removeIndemniteExercice(indemniteId);
            this.fraisIndemnites.exercices = this.fraisIndemnites.exercices.filter(
                (m) => m.id != indemniteId
            );
            return data;
        },
        async addIndemniteIntervention(indemnite) {
            const data = await ImputationService.addIndemniteIntervention(indemnite);
            this.fraisIndemnites.interventions.push(data);
            return data;
        },
        async updateIndemniteIntervention(indemnite) {
            const data = await ImputationService.updateIndemniteIntervention(indemnite);
            this.fraisIndemnites.interventions = this.fraisIndemnites.interventions.map((m) =>
                m.id === data.id ? data : m
            );
            return data;
        },
        async removeIndemniteIntervention(indemniteId) {
            const data = await ImputationService.removeIndemniteIntervention(indemniteId);
            this.fraisIndemnites.interventions =
                this.fraisIndemnites.interventions.filter((m) => m.id != indemniteId);
            return data;
        },
    },
});