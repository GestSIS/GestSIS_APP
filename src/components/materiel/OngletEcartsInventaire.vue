<script setup>
import { computed } from "vue";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useSapeurStore } from "../../stores/sapeur/Sapeur";
import { indexedData } from "../../tools/index.js";
import { nomSapeur } from "../../tools/inventaire.js";
import TableEcarts from "./TableEcarts.vue";

// Passé par la page à chaque onglet ; le traitement des écarts ne dépend pas de la saisie
defineProps({ modifiable: { type: Boolean, default: false } });

const inventaireStore = useInventaireStore();
const sapeurStore = useSapeurStore();
const indexedSapeurs = computed(() => indexedData(sapeurStore.liste));

const validePar = computed(() =>
  nomSapeur(indexedSapeurs.value[inventaireStore.courant.valide_par_sapeur_id]),
);
</script>

<template>
  <div v-if="inventaireStore.courant.statut !== 'VALIDE'" class="alert alert-info" role="status">
    Cet inventaire est encore en cours : ses écarts pourront être traités une fois validé.
  </div>
  <template v-else>
    <base-card v-if="inventaireStore.courant.remarque">
      <template #body>
        <strong>Remarque de {{ validePar }} :</strong>
        {{ inventaireStore.courant.remarque }}
      </template>
    </base-card>
    <table-ecarts />
  </template>
</template>
