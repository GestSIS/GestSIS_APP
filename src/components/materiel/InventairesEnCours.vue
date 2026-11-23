<script setup>
import { computed } from "vue";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useSapeurStore } from "../../stores/sapeur/Sapeur";
import { useModalStore } from "../../stores/common/Modal";
import { useSubmit } from "../../composables/useSubmit.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import permissions from "../../composables/permissions.js";
import { indexedData } from "../../tools/index.js";
import { formatDateTime } from "../../tools/formatters.js";
import { etapesInventaire, nomSapeur } from "../../tools/inventaire.js";
import CheminEmplacement from "./CheminEmplacement.vue";

// Emplacement choisi dans « État par emplacement », proposé pour démarrer un inventaire
const { selectionId } = defineProps({
  selectionId: {
    type: Number,
    default: null,
  },
});

const inventaireStore = useInventaireStore();
const emplacementStore = useEmplacementStore();
const sapeurStore = useSapeurStore();
const { showModal, confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();
const hasInventairePermission = useHasPermission(permissions.MATERIEL.INVENTAIRE);

const computedData = computed(() => {
  const indexedEmplacements = indexedData(emplacementStore.liste);
  const indexedSapeurs = indexedData(sapeurStore.liste);
  return inventaireStore.enCours.map((i) => ({
    ...i,
    etapes: etapesInventaire(i, indexedEmplacements),
    demarrePar: nomSapeur(indexedSapeurs[i.demarre_par_sapeur_id]),
    commence: i.lignes_verifiees_count > 0,
    avancement:
      i.lignes_count === 0 ? 0 : Math.round((i.lignes_verifiees_count / i.lignes_count) * 100),
  }));
});

const demarrer = () =>
  showModal({ component: "ModalDemarrerInventaire", data: { emplacementId: selectionId } });

const supprimer = async (inventaire) => {
  if (
    await confirm(
      `Supprimer « ${inventaire.designation} » ?`,
      "L'inventaire et tout ce qui a été saisi sont effacés. Les emplacements pourront être inventoriés à nouveau.",
    )
  ) {
    await submit(
      () => inventaireStore.supprimerInventaire(inventaire.id),
      "Impossible de supprimer l'inventaire",
      "Inventaire supprimé.",
    );
  }
};
</script>

<template>
  <base-card :title="`En cours (${computedData.length})`">
    <template #header>
      <button
        v-if="hasInventairePermission"
        type="button"
        class="btn btn-primary btn-sm"
        @click="demarrer"
      >
        Démarrer un inventaire
      </button>
    </template>
    <template #body>
      <p v-if="computedData.length === 0" class="text-body-secondary mb-0">
        Aucun inventaire en cours.
      </p>
      <ul v-else class="list-unstyled mb-0">
        <li
          v-for="inventaire in computedData"
          :key="inventaire.id"
          class="d-flex flex-wrap align-items-center gap-3 py-2 border-bottom"
        >
          <div class="flex-grow-1">
            <chemin-emplacement :etapes="inventaire.etapes" />
            <div class="d-block fw-bold mt-1">{{ inventaire.designation }}</div>
            <div class="small text-body-secondary">
              Démarré le {{ formatDateTime(inventaire.created_at) }} par
              {{ inventaire.demarrePar }}
            </div>
          </div>
          <div style="min-width: 200px">
            <div class="small">
              {{
                inventaire.commence
                  ? `${inventaire.lignes_verifiees_count} / ${inventaire.lignes_count} vérifiées`
                  : `Pas encore commencé · ${inventaire.lignes_count} pièces`
              }}
            </div>
            <div
              class="progress"
              role="progressbar"
              :aria-label="`Avancement de ${inventaire.designation}`"
              :aria-valuenow="inventaire.avancement"
              aria-valuemin="0"
              aria-valuemax="100"
              style="height: 6px"
            >
              <div class="progress-bar" :style="{ width: `${inventaire.avancement}%` }"></div>
            </div>
          </div>
          <router-link
            :to="{ name: 'materiel-inventaire-details', params: { id: inventaire.id } }"
            class="btn btn-outline-primary btn-sm"
          >
            {{ inventaire.commence ? "Reprendre" : "Commencer" }}
          </router-link>
          <button
            v-if="hasInventairePermission"
            type="button"
            class="btn btn-outline-danger btn-sm border-0"
            title="Supprimer"
            :aria-label="`Supprimer ${inventaire.designation}`"
            :disabled="isSubmitting"
            @click="supprimer(inventaire)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </li>
      </ul>
    </template>
  </base-card>
</template>
