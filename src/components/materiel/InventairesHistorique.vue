<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useSapeurStore } from "../../stores/sapeur/Sapeur";
import { useModalStore } from "../../stores/common/Modal";
import { useSubmit } from "../../composables/useSubmit.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import permissions from "../../composables/permissions.js";
import { groupedByData, indexedData } from "../../tools/index.js";
import { etapesEmplacement } from "../../tools/materiel.js";
import {
  ancetresEtSoi,
  descendantsEtSoi,
  emplacementInventorie,
  etapesInventaire,
  nomSapeur,
} from "../../tools/inventaire.js";
import CheminEmplacement from "./CheminEmplacement.vue";

// Inventaires validés ; avec un emplacement choisi (dans l'URL), ceux qui le couvrent
// (« Inclut ») ou portent sur un de ses sous-emplacements (« Partiel »).
const { selectionId } = defineProps({
  selectionId: {
    type: Number,
    default: null,
  },
});

const router = useRouter();
const inventaireStore = useInventaireStore();
const emplacementStore = useEmplacementStore();
const sapeurStore = useSapeurStore();
const { confirm } = useModalStore();
const { isSubmitting, submit } = useSubmit();
const hasInventairePermission = useHasPermission(permissions.MATERIEL.INVENTAIRE);

const computedData = computed(() => {
  const indexedEmplacements = indexedData(emplacementStore.liste);
  const indexedSapeurs = indexedData(sapeurStore.liste);
  const ancetres = selectionId ? ancetresEtSoi(selectionId, indexedEmplacements) : [];
  const descendants = selectionId
    ? descendantsEtSoi(
        selectionId,
        groupedByData(
          emplacementStore.liste.filter((e) => e.statut),
          "parent_id",
        ),
      )
    : [];
  const inventaires = inventaireStore.valides
    .filter((i) => {
      const id = emplacementInventorie(i);
      return !selectionId || ancetres.includes(id) || descendants.includes(id);
    })
    .map((i) => {
      const id = emplacementInventorie(i);
      let portee = "";
      if (selectionId && id !== selectionId) {
        portee = ancetres.includes(id)
          ? `Inclut ${indexedEmplacements[selectionId]?.designation}`
          : "Partiel";
      }
      return {
        ...i,
        etapes: etapesInventaire(i, indexedEmplacements),
        perimetre: i.racine?.designation ?? "",
        portee,
        validePar: nomSapeur(indexedSapeurs[i.valide_par_sapeur_id]),
        ecartsTraites: i.ecarts_count - i.ecarts_a_traiter_count,
      };
    });
  return {
    inventaires,
    etapesSelection: selectionId ? etapesEmplacement(selectionId, indexedEmplacements) : [],
  };
});

const toutAfficher = () => router.push({ name: "materiel-inventaires" });

const supprimer = async (inventaire) => {
  if (
    await confirm(
      `Supprimer « ${inventaire.designation} » ?`,
      "L'inventaire et tout ce qui a été saisi sont effacés. Les écarts déjà traités restent appliqués au stock.",
    )
  ) {
    await submit(
      () => inventaireStore.supprimerInventaire(inventaire.id),
      "Impossible de supprimer l'inventaire",
      "Inventaire supprimé.",
    );
  }
};

const fields = [
  { title: "Date", key: "date", type: Date },
  { title: "Périmètre", slot: "perimetre", sortKey: "perimetre" },
  { title: "Inventaire", key: "designation" },
  { title: "Validé par", key: "validePar" },
  { title: "Résultat", slot: "resultat", sortKey: "ecarts_count" },
  { title: "Actions", slot: "actions" },
];
</script>

<template>
  <base-card>
    <template #title>
      Historique
      <span v-if="selectionId" class="d-block small fw-normal mt-1">
        Concernant
        <chemin-emplacement :etapes="computedData.etapesSelection" />
      </span>
    </template>
    <template #header>
      <button
        v-if="selectionId"
        type="button"
        class="btn btn-outline-secondary btn-sm"
        @click="toutAfficher"
      >
        Tout l'historique
      </button>
    </template>
    <template #body-table>
      <base-table
        :data="computedData.inventaires"
        :fields="fields"
        no-data="Aucun inventaire validé"
        selectable
      >
        <template #perimetre="{ rowData }">
          <chemin-emplacement :etapes="rowData.etapes" />
          <span v-if="rowData.portee" class="badge text-bg-light border ms-1">
            {{ rowData.portee }}
          </span>
        </template>
        <template #resultat="{ rowData }">
          <span v-if="rowData.ecarts_count === 0" class="badge text-bg-success">
            Complet · {{ rowData.lignes_count }} / {{ rowData.lignes_count }}
          </span>
          <template v-else>
            <span class="badge text-bg-warning">
              {{ rowData.ecarts_count }} écart{{ rowData.ecarts_count > 1 ? "s" : "" }}
            </span>
            <span class="d-block small text-body-secondary">
              {{
                rowData.ecarts_a_traiter_count === 0
                  ? "Écarts traités"
                  : `Écarts : ${rowData.ecartsTraites} / ${rowData.ecarts_count} traités`
              }}
            </span>
          </template>
        </template>
        <template #actions="{ rowData }">
          <router-link
            :to="{ name: 'materiel-inventaire-details', params: { id: rowData.id } }"
            class="btn btn-sm btn-outline-primary border-0"
            title="Voir"
            :aria-label="`Voir ${rowData.designation}`"
          >
            <font-awesome-icon :icon="['far', 'eye']" />
          </router-link>
          <button
            v-if="hasInventairePermission"
            type="button"
            class="btn btn-sm btn-outline-danger border-0"
            title="Supprimer"
            :aria-label="`Supprimer ${rowData.designation}`"
            :disabled="isSubmitting"
            @click.stop="supprimer(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </template>
  </base-card>
</template>
