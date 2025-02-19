import MatPersoMaterielService from '../../services/materiel/MaterielService.js';
import { defineStore } from 'pinia';

export const useMaterielStore = defineStore('materiel', {
  state: () => ({
    aRecuperer: [],
    liste: [],
  }),
  actions: {
    fetchMatPerso() {
      return MatPersoMaterielService.getMateriel().then(
        (data) => (this.liste = data)
      );
    },
    fetchMatPersoARecuperer() {
      return MatPersoMaterielService.getARecuperer().then(
        (data) => (this.aRecuperer = data)
      );
    },
    attribuerMatPerso(attributions) {
      return MatPersoMaterielService.attribuer(attributions).then(
        (data) => (this.liste = data)
      );
    },
    retourMatPerso(retours) {
      return MatPersoMaterielService.retour(retours).then(
        (data) => (this.liste = data)
      );
    },
    addMatPerso(materiels) {
      return MatPersoMaterielService.create(materiels).then(
        (data) => (this.liste = data)
      );
    },
    updateMatPerso(materiels) {
      return MatPersoMaterielService.update(materiels).then(
        (data) => (this.liste = data)
      );
    },
    removeMatPerso(materielsIds) {
      return MatPersoMaterielService.remove(materielsIds).then((data) => {
        const setIds = new Set(ids);
        this.liste = [...this.liste.filter((m) => !setIds.has(m.id))];
      });
    },
  },
});
