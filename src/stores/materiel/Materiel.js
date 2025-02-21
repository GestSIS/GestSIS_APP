import MaterielTypesService from '../../services/materiel/TypeService.js';
import { defineStore } from 'pinia';

export const useMaterielTypeStore = defineStore('materielType', {
  state: () => ({
    liste: [],
  }),
  actions: {
    fetchMaterielType() {
      return MaterielTypesService.getTypes().then(
        (data) => (this.liste = data)
      );
    },
  },
});
