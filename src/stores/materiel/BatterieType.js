import BatterieTypeService from '../../services/materiel/BatterieTypeService.js';
import { defineStore } from 'pinia';

export const useBatterieTypeStore = defineStore('batterie-type', {
  state: () => ({
    liste: [],
  }),
  actions: {
    fetchBatterieTypes() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      } else {
        return BatterieTypeService.getBatterieTypes().then(
          (data) =>
          (this.liste = data
            .slice(0)
            .sort((t1, t2) => t1.designation > t2.designation))
        );
      }
    },
    addBatterieType(BatterieType) {
      return BatterieTypeService.addBatterieType(BatterieType).then((data) => {
        this.liste = [...this.liste, data];
        return data;
      });
    },
    updateBatterieType(BatterieType) {
      return BatterieTypeService.updateBatterieType(BatterieType).then((data) => {
        this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
        return data;
      });
    },
    removeBatterieType(BatterieTypeId) {
      return BatterieTypeService.removeBatterieType(BatterieTypeId).then((data) => {
        this.liste = this.liste.filter((m) => m.id != BatterieTypeId);
        return data;
      });
    },
  },
});
