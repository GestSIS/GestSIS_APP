import { defineStore } from "pinia";
import TravailService from "../../services/TravailService.js";

// Colonne de la fiche portant le lien, par genre d'événement
const colonnes = { intervention: "intervention_id", exercice: "exercice_id" };

export const useTravailStore = defineStore("travail", {
  state: () => ({
    liste: [],
    // Fiches liées à l'intervention ou à l'exercice affiché dans l'onglet Présences
    evenement: { genre: null, id: null },
    lies: [],
  }),
  actions: {
    async fetchTravauxEvenement(genre, id) {
      const data =
        genre === "exercice"
          ? await TravailService.getTravauxExercice(id)
          : await TravailService.getTravauxIntervention(id);
      this.evenement = { genre, id };
      this.lies = data.sort((t1, t2) => (t1.date > t2.date ? 1 : -1));
      return data;
    },
    estLieeAEvenement(travail) {
      const colonne = colonnes[this.evenement.genre];
      return (
        colonne !== undefined && travail[colonne] != null && travail[colonne] == this.evenement.id
      );
    },
    remplacerLie(travail) {
      this.lies = this.lies.map((t) => (t.id === travail.id ? { ...t, ...travail } : t));
    },
    async fetchTravaux(exerciceComptableId) {
      const data = await TravailService.getTravaux(exerciceComptableId);
      this.liste = data.sort((t1, t2) => t1.date > t2.date);
      return data;
    },
    async addTravaux(travaux) {
      const data = await TravailService.addTravaux(travaux);
      data?.forEach((travail) => {
        this.liste = [...this.liste, travail];
        if (this.estLieeAEvenement(travail)) {
          this.lies = [...this.lies, travail];
        }
      });
      return data;
    },
    async updateTravail(type) {
      const data = await TravailService.updateTravail(type);
      this.liste = this.liste.map((m) => (m.id === data.id ? { ...m, ...data } : m));
      if (this.estLieeAEvenement(data)) {
        this.remplacerLie(data);
      } else {
        this.lies = this.lies.filter((m) => m.id !== data.id);
      }
      return data;
    },
    async reviewTravail(travail) {
      const data = await TravailService.reviewTravail(travail);
      this.liste = this.liste.map((m) => (m.id === data.id ? { ...m, ...data } : m));
      this.remplacerLie(data);
      return data;
    },
    async cancelReviewTravail(travailId) {
      const data = await TravailService.cancelReviewTravail(travailId);
      this.liste = this.liste.map((m) => (m.id === data.id ? { ...m, ...data } : m));
      this.remplacerLie(data);
      return data;
    },
    async removeTravail(travailId) {
      const data = await TravailService.removeTravail(travailId);
      this.liste = this.liste.filter((m) => m.id != travailId);
      this.lies = this.lies.filter((m) => m.id != travailId);
      return data;
    },
  },
});
