<script setup>
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useSapeurStore } from "../../stores/sapeur/Sapeur";
import InventairesEnCours from "./InventairesEnCours.vue";
import InventairesEcartsATraiter from "./InventairesEcartsATraiter.vue";
import InventairesParEmplacement from "./InventairesParEmplacement.vue";
import InventairesHistorique from "./InventairesHistorique.vue";

// Emplacement choisi dans « État par emplacement » (paramètre de l'URL)
const { selectionId } = defineProps({
  selectionId: {
    type: Number,
    default: null,
  },
});

await Promise.all([
  useInventaireStore().fetchInventaires(),
  useEmplacementStore().fetchEmplacements(),
  useCouleurStore().fetchCouleurs(),
  useSapeurStore().fetchSapeurs(),
]);
</script>

<template>
  <div class="row mt-3">
    <div class="col-lg-8 col-12">
      <inventaires-en-cours :selection-id="selectionId" />
    </div>
    <div class="col-lg-4 col-12">
      <inventaires-ecarts-a-traiter />
    </div>
    <div class="col-xl-5 col-12">
      <inventaires-par-emplacement :selection-id="selectionId" />
    </div>
    <div class="col-xl-7 col-12">
      <inventaires-historique :selection-id="selectionId" />
    </div>
  </div>
</template>
