<script setup>
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed, inject } from 'vue';

const store = useStore();
await store.dispatch('fetchMedecins');

const fields = [
  { title: 'Désignation', key: 'designation' },
  { title: 'Adresse', key: 'adresse' },
  { title: 'Localité', key: 'localite' },
  { title: 'Actif', key: 'actif', type: Boolean },
  { title: 'Actions', slot: 'actions' },
];

const listeMedecin = computed(() =>
  store.state.medecin.liste
    .map((m) => ({
      ...m,
      localite: store.state.localite.liste.find((l) => l.id == m.localite_id)
        ?.designation,
    }))
    .sort((a, b) => a.designation?.localeCompare(b.designation)),
);

const { showModal } = useModalStore();
const awn = inject('awn');
const ajoutMedecin = () => showModal({ component: 'ModalMedecin', data: {} });
const updateMedecin = (medecin) =>
  showModal({ component: 'ModalMedecin', data: { ...medecin } });
const deleteMedecin = (medecin) =>
  store
    .dispatch('removeMedecin', medecin.id)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Médecins</h3>
      <button type="button" class="btn btn-primary" @click="ajoutMedecin">
        Ajouter un médecin
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeMedecin"
        :fields="fields"
        no-data="Aucun médecin"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateMedecin(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteMedecin(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
