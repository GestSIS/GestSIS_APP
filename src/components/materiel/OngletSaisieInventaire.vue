<script setup>
import { computed } from "vue";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { descendantsEtSoi } from "../../tools/inventaire.js";
import NavigationInventaire from "./NavigationInventaire.vue";
import SaisieInventaire from "./SaisieInventaire.vue";
import TableLignesInventaire from "./TableLignesInventaire.vue";
import EcartsInventaire from "./EcartsInventaire.vue";

const { noeudId, modifiable } = defineProps({
  // Nœud affiché (la racine par défaut)
  noeudId: {
    type: String,
    default: "",
  },
  modifiable: {
    type: Boolean,
    default: false,
  },
});

const inventaireStore = useInventaireStore();

const selectionId = computed(() => Number(noeudId) || inventaireStore.racine.id);
// Une section par nœud affiché qui contient du matériel
const sectionIds = computed(() =>
  descendantsEtSoi(selectionId.value, inventaireStore.noeudsParParent).filter(
    (noeud) => inventaireStore.articlesParNoeud[noeud],
  ),
);
</script>

<template>
  <div class="row">
    <div class="col-xl-3 col-lg-4 col-12">
      <navigation-inventaire :selection-id="selectionId" />
    </div>
    <div class="col-xl-6 col-lg-8 col-12">
      <saisie-inventaire v-if="modifiable" :selection-id="selectionId" />
      <p v-if="sectionIds.length === 0" class="text-body-secondary">
        Aucun matériel dans cet emplacement.
      </p>
      <table-lignes-inventaire
        v-for="sectionId in sectionIds"
        :key="sectionId"
        :noeud-id="sectionId"
        :modifiable="modifiable"
      />
    </div>
    <div class="col-xl-3 col-12">
      <ecarts-inventaire />
    </div>
  </div>
</template>
