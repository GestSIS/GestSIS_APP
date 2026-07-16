import { defineStore } from "pinia";
import CompteService from "../../services/CompteService.js";

export const useCompteStore = defineStore("compte", {
  state: () => ({
    liste: [],
  }),
  actions: {
    async fetchComptes() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      }
      const data = await CompteService.getComptes();
      this.liste = data.map((c) => ({
        ...c,
        label: `${c.numero} ${c.designation}`,
      }));
      return data;
    },
    async addCompte(compte) {
      const data = await CompteService.addCompte(compte);
      this.liste.push({
        ...data,
        label: `${data.numero} ${data.designation}`,
      });
      return data;
    },
    async updateCompte(compte) {
      const data = await CompteService.updateCompte(compte);
      this.liste = this.liste.map((m) =>
        m.id === data.id
          ? {
              ...data,
              label: `${data.numero} ${data.designation}`,
            }
          : m,
      );
      return data;
    },
    async removeCompte(compteId) {
      const data = await CompteService.removeCompte(compteId);
      this.liste = this.liste.filter((m) => m.id != compteId);
      return data;
    },
  },
});
