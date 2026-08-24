<script setup>
import { computed } from "vue";
import { useVehiculeStore } from "../../stores/intervention/Vehicule.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useHasPermission from "../../composables/usePermission.js";
import permissions from "../../composables/permissions.js";

const vehiculeStore = useVehiculeStore();
await vehiculeStore.fetchVehicules();

const hasEditPermission = useHasPermission(permissions.MATERIEL.MODIFICATION);

const fields = [
  { columnClass: "col-2", title: "Actif", key: "statut", type: Boolean },
  { title: "Désignation", key: "designation" },
  ...(hasEditPermission.value ? [{ title: "Actions", slot: "actions" }] : []),
];

const vehicules = computed(() => vehiculeStore.liste.slice().sort((a, b) => a.tri - b.tri));

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
          <button type="button" class="btn btn-outline-primary border-0" @click="modifier(rowData)">
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
