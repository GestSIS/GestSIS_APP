<script setup>
import { useExcuseTypeStore } from '../../stores/exercice/ExcuseType.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed, inject } from 'vue';

const excuseTypeStore = useExcuseTypeStore();
await excuseTypeStore.fetchExcuseTypes();

const fields = [
  { title: 'Tri', key: 'tri' },
  { title: 'Abréviation', key: 'abreviation' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Amende', key: 'amende', type: Boolean },
  {
    title: 'Disponibilité',
    key: 'statut',
    formatter: (statut) =>
      ({
        0: 'Désactivé',
        1: "Exercice + S'excuser",
        2: 'Exercice',
      })[statut],
  },
  { title: 'Actions', slot: 'actions' },
];
const listeExcuse = computed(() =>
  excuseTypeStore.liste.sort((a, b) => a.tri - b.tri),
);

const { showModal } = useModalStore();
const awn = inject('awn');
const ajoutExcuse = () => showModal({ component: 'ModalExcuseType', data: {} });
const updateExcuse = (excuse) =>
  showModal({ component: 'ModalExcuseType', data: { ...excuse } });
const deleteExcuse = (excuse) =>
  excuseTypeStore
    .removeExcuseType(excuse.id)
    .catch((res) => awn.alert(res.message || 'Erreur lors de la suppression'));
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Excuses types</h3>
      <button type="button" class="btn btn-primary" @click="ajoutExcuse()">
        Ajouter une excuse
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeExcuse"
        :fields="fields"
        no-data="Aucune excuse type"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateExcuse(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteExcuse(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
