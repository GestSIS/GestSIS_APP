<script setup>
import { computed } from "vue";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { indexedData } from "../../tools/index.js";
import { formatDate } from "../../tools/formatters.js";
import { etapesInventaire } from "../../tools/inventaire.js";
import CheminEmplacement from "./CheminEmplacement.vue";

const inventaireStore = useInventaireStore();
const emplacementStore = useEmplacementStore();

const computedData = computed(() => {
  const indexedEmplacements = indexedData(emplacementStore.liste);
  // Chemin complet : deux emplacements de même nom (ex. « VPI ») se distinguent par leur parent
  const inventaires = inventaireStore.valides
    .filter((i) => i.ecarts_a_traiter_count > 0)
    .map((i) => ({ ...i, etapes: etapesInventaire(i, indexedEmplacements) }));
  return {
    inventaires,
    total: inventaires.reduce((total, i) => total + i.ecarts_a_traiter_count, 0),
  };
});
</script>

<template>
  <base-card>
    <template #title>Écarts à traiter</template>
    <template #body>
      <p v-if="computedData.total === 0" class="text-body-secondary mb-0">Aucun écart à traiter.</p>
      <template v-else>
        <div class="fw-bold fs-5">
          {{ computedData.total }} écart{{ computedData.total > 1 ? "s" : "" }} dans
          {{ computedData.inventaires.length }} inventaire{{
            computedData.inventaires.length > 1 ? "s" : ""
          }}
        </div>
        <ul class="list-unstyled mb-0 mt-2">
          <li
            v-for="inventaire in computedData.inventaires"
            :key="inventaire.id"
            class="border-top"
          >
            <router-link
              :to="{ name: 'materiel-inventaire-ecarts', params: { id: inventaire.id } }"
              class="btn btn-sm w-100 d-flex align-items-center gap-2 text-start border-0 py-2"
              :title="`Traiter les écarts de ${inventaire.designation}`"
            >
              <span class="flex-grow-1">
                <chemin-emplacement :etapes="inventaire.etapes" :depliable="false" class="small" />
                <span class="d-block small text-body-secondary">
                  {{ inventaire.designation }} · {{ formatDate(inventaire.date) }}
                </span>
              </span>
              <span class="badge rounded-pill text-bg-danger">
                {{ inventaire.ecarts_a_traiter_count }}
              </span>
            </router-link>
          </li>
        </ul>
      </template>
    </template>
  </base-card>
</template>
