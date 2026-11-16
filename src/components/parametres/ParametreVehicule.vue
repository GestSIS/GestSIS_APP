<script setup>
import { computed } from "vue";
import { useVehiculeStore } from "../../stores/intervention/Vehicule.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import permissions from "../../composables/permissions.js";

const vehiculeStore = useVehiculeStore();
await vehiculeStore.fetchVehicules();

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const fields = [
  {
    columnClass: "col-2",
    title: "Disponible en intervention",
    key: "disponible_intervention",
    type: Boolean,
  },
  { title: "Désignation", key: "designation" },
  ...(hasEditPermission.value ? [{ title: "Actions", slot: "actions" }] : []),
];

const vehicules = computed(() =>
  vehiculeStore.liste.filter((v) => v.supprime_le === null).sort((a, b) => a.tri - b.tri),
);

const { showModal } = useModalStore();
const ajouter = () =>
  showModal({
    component: "ModalArticle",
    data: { vehiculeUniquement: true },
    callback: () => vehiculeStore.fetchVehicules(),
  });
const modifier = (vehicule) =>
  showModal({
    component: "ModalArticle",
    data: { ...vehicule },
    callback: () => vehiculeStore.fetchVehicules(),
  });
const supprimer = (vehicule) =>
  showModal({
    component: "ModalSuppressionArticle",
    data: { articles: [vehicule] },
    callback: () => vehiculeStore.fetchVehicules(),
  });
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Véhicules</h3>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-primary btn-sm"
        @click="ajouter"
      >
        Ajouter
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table :data="vehicules" :fields="fields" no-data="Aucun véhicule" :selectable="true">
        <template #actions="{ rowData }">
          <button
            aria-label="Modifier"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="modifier(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            aria-label="Supprimer"
            title="Supprimer"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimer(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
