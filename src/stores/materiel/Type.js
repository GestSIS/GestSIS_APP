import MaterielTypeService from '../../services/materiel/TypeService.js';
import { defineStore } from 'pinia';

export const useMaterielTypeStore = defineStore('materielType', {
  state: () => ({
    liste: [],
  }),
  actions: {
    fetchMaterielTypes() {
      if (this.liste.length > 0) {
        return Promise.resolve();
      } else {
        return MaterielTypeService.getTypes().then(
          (data) =>
          (this.liste = data
            .slice(0)
            .sort((t1, t2) => t1.designation > t2.designation))
        );
      }
    },
    addMaterielType(type) {
      return MaterielTypeService.addType(type).then((data) => {
        this.liste = [...this.liste, data];
        return data;
      });
    },
    updateMaterielType(type) {
      return MaterielTypeService.updateType(type).then((data) => {
        this.liste = [...this.liste.map((m) => (m.id === data.id ? data : m))];
        return data;
      });
    },
    removeMaterielType(typeId) {
      return MaterielTypeService.removeType(typeId).then((data) => {
        this.liste = this.liste.filter((m) => m.id != typeId);
        return data;
      });
    },
  },
});
