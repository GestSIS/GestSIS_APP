<script setup>
import { computed } from "vue";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useSapeurStore } from "../../stores/sapeur/Sapeur";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useModalStore } from "../../stores/common/Modal";
import { indexedData } from "../../tools/index.js";
import { formatDate, formatDateTime } from "../../tools/formatters.js";
import { etapeEmplacement, etapesEmplacement } from "../../tools/materiel.js";
import { nomSapeur, piecesEcart } from "../../tools/inventaire.js";
import CheminEmplacement from "./CheminEmplacement.vue";

const { modifiable } = defineProps({
  modifiable: {
    type: Boolean,
    default: false,
  },
});

const inventaireStore = useInventaireStore();
const sapeurStore = useSapeurStore();
const indexedSapeurs = computed(() => indexedData(sapeurStore.liste));
const emplacementStore = useEmplacementStore();

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));

const computedData = computed(() => {
  const inventaire = inventaireStore.courant;
  const racine = inventaireStore.racine;
  const emplacement = indexedEmplacements.value[racine.emplacement_id];
  const valide = inventaire.statut === "VALIDE";
  // En cours : lignes vérifiées ; validé : pièces en écart traitées
  const fait = valide
    ? piecesEcart(inventaireStore.ecarts.filter((e) => e.decision !== null))
    : inventaire.lignes.filter((l) => l.statut !== null).length;
  const total = valide ? piecesEcart(inventaireStore.ecarts) : inventaire.lignes.length;
  return {
    valide,
    inventaire,
    // Chemin actuel des parents de l'emplacement inventorié, puis la racine figée
    etapes: [
      ...etapesEmplacement(emplacement?.parent_id, indexedEmplacements.value),
      etapeEmplacement(emplacement, racine.designation),
    ],
    sousEmplacements: inventaireStore.noeuds.length - 1,
    demarrePar: nomSapeur(indexedSapeurs.value[inventaire.demarre_par_sapeur_id]),
    validePar: nomSapeur(indexedSapeurs.value[inventaire.valide_par_sapeur_id]),
    fait,
    total,
    libelle: valide ? "écarts traités" : "lignes vérifiées",
    reste: valide ? "à traiter" : "à vérifier",
    avancement: total ? Math.round((fait / total) * 100) : 100,
  };
});

const { showModal } = useModalStore();
const valider = () => showModal({ component: "ModalValiderInventaire", size: 1 });
</script>

<template>
  <base-card>
    <template #body>
      <div class="d-flex flex-wrap align-items-center gap-3">
        <div class="flex-grow-1">
          <span
            class="badge me-2"
            :class="computedData.valide ? 'text-bg-success' : 'text-bg-info'"
          >
            {{ computedData.valide ? "Validé" : "En cours" }}
          </span>
          <chemin-emplacement :etapes="computedData.etapes" class="fs-6" />
          <h4 class="mt-1 mb-0">{{ computedData.inventaire.designation }}</h4>
          <div class="small text-body-secondary">
            Inventaire du {{ formatDate(computedData.inventaire.date) }} · démarré le
            {{ formatDateTime(computedData.inventaire.created_at) }} par
            {{ computedData.demarrePar }} · {{ computedData.sousEmplacements }} sous-emplacement{{
              computedData.sousEmplacements > 1 ? "s" : ""
            }}
            inclus
            <template v-if="computedData.valide">
              · validé le {{ formatDateTime(computedData.inventaire.valide_le) }} par
              {{ computedData.validePar }}
            </template>
          </div>
        </div>
        <div style="min-width: 260px">
          <div class="d-flex justify-content-between small">
            <span>
              <strong>{{ computedData.fait }} / {{ computedData.total }}</strong>
              {{ computedData.libelle }}
            </span>
            <span class="text-body-secondary">
              {{ computedData.total - computedData.fait }} {{ computedData.reste }}
            </span>
          </div>
          <div
            class="progress"
            role="progressbar"
            :aria-label="computedData.valide ? 'Écarts traités' : 'Avancement de l\'inventaire'"
            :aria-valuenow="computedData.avancement"
            aria-valuemin="0"
            aria-valuemax="100"
            style="height: 8px"
          >
            <div
              class="progress-bar"
              :class="{ 'bg-success': computedData.valide }"
              :style="{ width: `${computedData.avancement}%` }"
            ></div>
          </div>
        </div>
        <button v-if="modifiable" type="button" class="btn btn-primary" @click="valider">
          Terminer et vérifier les écarts
        </button>
      </div>
    </template>
  </base-card>
</template>
