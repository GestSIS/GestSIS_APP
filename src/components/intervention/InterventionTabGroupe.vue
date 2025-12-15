<script setup>
import { computed, ref, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useInterventionStore } from '../../stores/intervention/Intervention.js';
import { useGroupeStore } from '../../stores/groupe/Groupe.js';
import useHasPermission from '../../composables/usePermission.js';
import permissions from '/src/composables/permissions.js';

const interventionStore = useInterventionStore();
const groupeStore = useGroupeStore();
groupeStore.fetchGroupes();

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
  await interventionStore.fetchInterventionGroupes(id);
  selected.value = Object.fromEntries(
    interventionStore.active.groupes.map((g) => [
      g.no + '_' + g.designation,
      true,
    ]),
  );
  loading.value = false;
});

const groupes = computed(() => {
  const selectedGroupes = interventionStore.active.groupes;
  const selectedNumeros = new Set(selectedGroupes.map((g) => g.no));

  const availableGroupes = groupeStore.liste
    .filter((g) => g.type === 1)
    .filter((g) => !selectedNumeros.has(g.no));

  return [...selectedGroupes, ...availableGroupes]
    .map((g) => ({
      ...g,
      pseudo_id: g.no + '_' + g.designation,
      label: g.no + ' ' + g.designation,
    }))
    .sort((g1, g2) => g1.no - g2.no);
});

// TODO: Check si intervention pas déjà imputé
const hasEditPermission = useHasPermission(
  permissions.INTERVENTION.MODIFICATION,
);

const awn = useNotification();

const editGroupe = async (groupeId) => {
  // FIXME: Edit and add groupe again
  const event = selected.value[groupeId];
  const groupe = groupes.value.find((g) => g.pseudo_id === groupeId);

  (event
    ? interventionStore.addInterventionGroupes([groupe])
    : interventionStore.removeInterventionGroupes([groupe.id])
  )
    .then(() => awn.success('Modifications enregistrées'))
    .catch((err) =>
      awn.alert(err.message ?? "Erreur lors de l'enregistrement"),
    );
};

const fields = [
  {
    title: 'Groupe',
    key: 'label',
  },
  {
    title: 'Alarmé',
    slot: 'check',
    columnClass: 'ps-4',
  },
];
</script>

<template>
  <div class="col-xs-12 col-md-6">
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Groupes</h3>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :data="groupes"
          :fields="fields"
          no-data="Aucun groupe de disponible pour votre SIS, ajoutez-en dans oragnisation."
        >
          <template #check="{ rowData }">
            <input
              :id="'v-' + rowData.pseudo_id"
              v-model="selected[rowData.pseudo_id]"
              :disabled="!hasEditPermission"
              type="checkbox"
              class="form-check-input"
              @change="editGroupe(rowData.pseudo_id)"
            />
            <label
              class="form-check-label"
              :for="'v-' + rowData.pseudo_id"
            ></label>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>
