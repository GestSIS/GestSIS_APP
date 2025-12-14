<script setup>
import { ref, computed, watchEffect } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useModalStore } from '../../stores/common/Modal.js';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';

const sapeurStore = useSapeurStore();
const localiteStore = useLocaliteStore();
const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await sapeurStore.fetchSapeurMutations(sapeurStore.active.id);
  loading.value = false;
});

const mutations = computed(() =>
  sapeurStore.active.mutations.map((m) => ({
    ...m,
    localite: localiteStore.liste.find((l) => l.id == m.localite_id)
      ?.designation,
  })),
);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);
const finServiceButtonState = computed(
  () => mutations.value.length > 0 && mutations.value.find((m) => !m.sortie),
);

const { showModal, confirm } = useModalStore();

const removeMutation = (mutation) =>
  confirm(
    'Voulez-vous vraiment supprimer cette mutation ?',
    "Attention, la suppression d'une mutation est irréversible ! Toutes les données de cette mutation seront perdues !",
  ).then(() => sapeurStore.removeMutation(mutation?.id));

const editMutation = (mutation) =>
  showModal({ component: 'ModalMutation', data: mutation });

const finService = () =>
  showModal({
    component: 'ModalMutation',
    data: { action: 'finService', ...mutations.value.find((m) => !m.sortie) },
  });

const incorporation = () => showModal('ModalMutation');

const fields = [
  { title: 'Incorporation', key: 'incorporation', type: Date },
  { title: 'Sortie', key: 'sortie', type: Date },
  { title: 'Motif', key: 'motif' },
  { title: 'Localité', key: 'localite' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Incorporation / Sortie</h3>
    </div>
    <!-- form start -->
    <form role="form">
      <div class="card-body">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="mutations"
          no-data="Aucune mutation"
        >
          <template #actions="{ rowData }">
            <button
              v-if="hasEditPermission"
              type="button"
              class="btn btn-outline-primary border-0"
              @click="editMutation(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              v-if="hasEditPermission"
              type="button"
              class="btn btn-outline-danger border-0"
              @click="removeMutation(rowData)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </template>
        </base-table>
        <button
          v-if="finServiceButtonState && hasEditPermission"
          type="button"
          class="btn btn-outline-primary"
          @click="finService"
        >
          <font-awesome-icon class="me-1" :icon="['fas', 'door-closed']" />Fin
          de service
        </button>
        <button
          v-else-if="hasEditPermission"
          type="button"
          class="btn btn-outline-primary"
          @click="incorporation"
        >
          <font-awesome-icon
            class="me-1"
            :icon="['fas', 'door-closed']"
          />Incorporation
        </button>
      </div>
    </form>
  </div>
</template>
