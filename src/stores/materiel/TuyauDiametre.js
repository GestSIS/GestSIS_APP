import TuyauDiametreService from '../../services/materiel/TuyauDiametreService.js';
import { defineStore } from 'pinia';

export const useTuyauDiametreStore = defineStore('tuyau-diametre', {
  state: () => ({
    liste: [],
  }),
  actions: {
    fetchTuyauDiametres() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      } else {
        return TuyauDiametreService.getTuyauDiametres().then(
          (data) =>
          (this.liste = data
            .slice(0)
            .sort((t1, t2) => t1.designation > t2.designation))
        );
      }
    },
    addTuyauDiametre(tuyauDiametre) {
      return TuyauDiametreService.addTuyauDiametre(tuyauDiametre).then((data) => {
        this.liste = [...this.liste, data];
        return data;
      });
    },
    updateTuyauDiametre(tuyauDiametre) {
      return TuyauDiametreService.updateTuyauDiametre(tuyauDiametre).then((data) => {
        this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
        return data;
      });
    },
    removeTuyauDiametre(id) {
      return TuyauDiametreService.removeTuyauDiametre(id).then((data) => {
        this.liste = this.liste.filter((m) => m.id != id);
        return data;
      });
    },
  },
});
