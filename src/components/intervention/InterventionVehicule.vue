<script setup>
import { computed, ref, watchEffect } from "vue";
import useNotification from "../../composables/useNotification.js";
import permissions from "/src/composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
import { useInterventionStore } from "../../stores/intervention/Intervention.js";
import { useVehiculeStore } from "../../stores/intervention/Vehicule.js";

const interventionStore = useInterventionStore();
const vehiculeStore = useVehiculeStore();

vehiculeStore.fetchVehicules();

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const selected = ref({});
const loading = ref(true);

watchEffect(async () => {
  loading.value = true;
  await interventionStore.fetchInterventionVehicules(id);
  selected.value = Object.fromEntries(
    interventionStore.active.vehicules.map((v) => [v.vehicule_id, true]),
  );
  loading.value = false;
});

const vehicules = computed(() =>
  vehiculeStore.liste.filter(
    (v) =>
      v.statut === true || interventionStore.active.vehicules.find((vi) => vi.vehicule_id === v.id),
  ),
);
const hasEditPermission = useHasPermission(permissions.INTERVENTION.MODIFICATION);

const awn = useNotification();

const editVehicule = async (vehiculeId) => {
  const event = selected.value[vehiculeId]
    ? "addInterventionVehicules"
    : "removeInterventionVehicules";

  interventionStore[event](id, [vehiculeId])
    .then(() => awn.success("Modifications enregistrées"))
    .catch((err) => awn.alert(err.message ?? "Erreur lors de l'enregistrement"));
};

const fields = [
  {
    title: "Véhicule",
    key: "designation",
  },
  {
    title: "Présent",
    key: "id",
    slot: "check",
    columnClass: "ps-4",
  },
];
</script>

<template>
  <div class="col-xs-12 col-lg-6">
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Véhicules</h3>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :data="vehicules"
          :fields="fields"
          no-data="Aucun véhicule de disponible pour votre SIS, ajoutez-en dans configuration."
        >
          <template #check="{ rowData }">
            <input
              :id="'v-' + rowData.id"
              v-model="selected[rowData.id]"
              :disabled="!hasEditPermission"
              type="checkbox"
              class="form-check-input"
              @change="editVehicule(rowData.id)"
            />
            <label class="form-check-label" :for="'v-' + rowData.id"></label>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>
