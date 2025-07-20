<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission';

const store = useStore();
store.dispatch('fetchVehicules');

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
  await store.dispatch('fetchInterventionVehicules', id);
  selected.value = Object.fromEntries(
    store.state.intervention.active.vehicules.map((v) => [v.vehicule_id, true]),
  );
  loading.value = false;
});

const vehicules = computed(() =>
  store.state.vehicule.liste.filter(
    (v) =>
      v.statut === 1 ||
      store.state.intervention.active.vehicules.find(
        (vi) => vi.vehicule_id === v.id,
      ),
  ),
);
const hasEditPermission = useHasPermission(
  permissions.INTERVENTION.MODIFICATION,
);

const awn = inject('awn');

const editVehicule = async (vehiculeId) => {
  const event = selected.value[vehiculeId]
    ? 'addInterventionVehicules'
    : 'removeInterventionVehicules';

  store
    .dispatch(event, [vehiculeId])
    .then(() => awn.success('Modifications enregistrées'))
    .catch((err) =>
      awn.alert(err.message ?? "Erreur lors de l'enregistrement"),
    );
};

const fields = [
  {
    title: 'Véhicule',
    key: 'designation',
  },
  {
    title: 'Présent',
    key: 'id',
    slot: 'check',
    columnClass: 'ps-4',
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
