import { defineStore } from "pinia";
import DecompteService from "../../services/DecompteService.js";

export const useDecompteStore = defineStore("decompte", {
  state: () => ({
    liste: [],
  }),
  actions: {
    fetchDecomptes(exerciceComptableId) {
      return DecompteService.getDecomptes(exerciceComptableId).then((data) => {
        this.liste = data;
        return data;
      });
    },
    removeDecompte(decompteId) {
      return DecompteService.removeDecompte(decompteId).then(() => {
        this.liste = this.liste.filter((d) => d.id !== decompteId);
      });
    },
    genererDecompteAnnuel(params) {
      return DecompteService.genererDecompteAnnuel(params).then((data) => {
        this.liste = [...this.liste, data];
        return data;
      });
      // TODO: Refresh data en cas de succès afin d'avoir des données à jour
      // Update les écritures afin de refresh l'interface
    },
    genererDecompteSapeur(params) {
      return DecompteService.genererDecompteSapeur(params).then((data) => {
        this.liste = [...this.liste, data];
        return data;
      });
      // TODO: Refresh data en cas de succès afin d'avoir des données à jour
      // Update les écritures afin de refresh l'interface
    },
    genererDecompteExercice(params) {
      return DecompteService.genererDecompteExercice(params).then((data) => {
        this.liste = [...this.liste, data];
        return data;
      });
      // TODO: Refresh data en cas de succès afin d'avoir des données à jour
      // Update les écritures afin de refresh l'interface
    },
  },
});
