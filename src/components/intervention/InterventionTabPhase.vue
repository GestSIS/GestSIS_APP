<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';
import { useInterventionStore } from '../../stores/intervention/Intervention.js';
import { usePhaseTypeStore } from '../../stores/intervention/PhaseType.js';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const interventionStore = useInterventionStore();
const phaseTypeStore = usePhaseTypeStore();

phaseTypeStore.fetchPhaseTypes();

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  interventionStore.fetchIntervention(id);
  interventionStore.fetchInterventionPhases(id);
  loading.value = false;
});

const interData = computed(() => interventionStore.active.data);
const phases = computed(() =>
  interventionStore.active.phases.map((p) => ({
    ...p,
    date_heure:
      p?.debut === null
        ? `${interventionStore.active.data?.date_debut} ${interventionStore.active.data?.heure_debut}`
        : p?.debut.slice(0, 16),
    designation: phaseTypeStore.liste.find(
      (phase) => phase.id == p.phase_type_id,
    )?.designation,
  })),
);
// TODO: Check si intervention pas déjà imputé
const hasEditPermission = useHasPermission(
  permissions.INTERVENTION.MODIFICATION,
);

const { confirm, showModal } = useModalStore();
const newPhase = () =>
  showModal({
    component: 'ModalPhase',
    data: {
      min: interData.value.date_debut + ' ' + interData.value.heure_debut,
      max: interData.value.date_fin + ' ' + interData.value.heure_fin,
    },
  });

const editPhase = (phase) =>
  showModal({
    component: 'ModalPhase',
    data: {
      ...phase,
      min: interData.value.date_debut + ' ' + interData.value.heure_debut,
      max: interData.value.date_fin + ' ' + interData.value.heure_fin,
    },
  });

const removePhase = (id) =>
  confirm(
    'Voulez-vous vraiment supprimer cette phase ?',
    "Attention, la suppression d'une phase est irréversible ! Toutes les données de cette phase seront perdues !",
  ).then(() => interventionStore.removePhase(id));

const fields = [
  { title: 'Début', key: 'date_heure', type: 'datetime' },
  { title: 'Type', key: 'designation' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="col-xs-12 col-md-6">
    <div class="card card-primary card-outline mb-3">
      <div class="card-header d-flex justify-content-between">
        <h3 class="card-title">Phases de l'intervention</h3>
        <button
          v-if="hasEditPermission"
          type="button"
          class="btn btn-primary"
          @click="newPhase"
        >
          Nouvelle phase
        </button>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :fields="fields"
          :data="phases"
          :selectable="true"
          no-data="Erreur, une phase est nécessaire pour chaque intervention, veuillez contacter l'administrateur du système."
        >
          <template #actions="{ rowData }">
            <button
              v-if="rowData.debut !== null && hasEditPermission"
              type="button"
              class="btn btn-outline-primary border-0 ms-2"
              @click="editPhase(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              v-if="rowData.debut !== null && hasEditPermission"
              type="button"
              class="btn btn-outline-danger border-0"
              @click="removePhase(rowData.id)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>
