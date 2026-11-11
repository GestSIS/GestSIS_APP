<script setup>
import { computed, ref, watchEffect } from "vue";
import { useSubmit } from "../../composables/useSubmit.js";
import permissions from "/src/composables/permissions.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
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

// Les cases sont désactivées pendant l'envoi : aucun clic ne peut être ignoré par useSubmit.
const { isSubmitting, submit } = useSubmit();

const editVehicule = async (vehiculeId) => {
  const present = selected.value[vehiculeId];
  const event = present ? "addInterventionVehicules" : "removeInterventionVehicules";

  const { ok } = await submit(
    () => interventionStore[event](id, [vehiculeId]),
    "Erreur lors de l'enregistrement",
    "Modifications enregistrées",
  );
  if (!ok) {
    // Rien n'a été enregistré : la case revient à son état précédent.
    selected.value[vehiculeId] = !present;
  }
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
              :disabled="!hasEditPermission || isSubmitting"
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
