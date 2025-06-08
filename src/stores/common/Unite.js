import UniteService from '../../services/UniteService.js';
import { defineStore } from 'pinia';

export const useUniteStore = defineStore('Unite', {
  state: () => ({
    liste: [],
  }),
  actions: {
    fetchUnites() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      } else {
        return UniteService.getUnites().then((data) => this.liste = data)
      }
    },
    addUnite(Unite) {
      return UniteService.addUnite(Unite).then((data) => {
        this.liste = [...this.liste, data];
        return data;
      });
    },
    updateUnite(Unite) {
      return UniteService.updateUnite(Unite).then((data) => {
        this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
        return data;
      });
    },
    removeUnite(UniteId) {
      return UniteService.removeUnite(UniteId).then((data) => {
        this.liste = this.liste.filter((m) => m.id != UniteId);
        return data;
      });
    },
  },
});
