<script setup>
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed, inject } from 'vue';

const store = useStore();
await store.dispatch('fetchInterventionTraitements');

const fields = [
  { title: 'Tri', key: 'tri' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Actions', slot: 'actions' },
];

const listeTraitement = computed(() =>
  store.state.interventionTraitement.liste.sort((a, b) => a.tri - b.tri),
);

const { showModal } = useModalStore();
const awn = inject('awn');

const ajoutTraitement = () =>
  showModal({ component: 'ModalInterventionTraitement', data: {} });

const updateTraitement = (traitement) =>
  showModal({
    component: 'ModalInterventionTraitement',
    data: { ...traitement },
  });

const deleteTraitement = (traitement) =>
  store
    .dispatch('removeInterventionTraitement', traitement.id)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Traitement</h3>
      <button type="button" class="btn btn-primary" @click="ajoutTraitement()">
        Ajouter un traitement
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeTraitement"
        :fields="fields"
        no-data="Aucun traitement"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateTraitement(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteTraitement(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
