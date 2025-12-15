<script setup>
import { useControleMedicalTypeStore } from '../../stores/controleMedical/ControleMedicalType.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { computed } from 'vue';
import useNotification from '../../composables/useNotification.js';

const controleMedicalTypeStore = useControleMedicalTypeStore();
await controleMedicalTypeStore.fetchTypes();

const fields = [
  { title: 'Tri', key: 'tri' },
  { title: 'Désignation', key: 'designation' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Validité [ans]', key: 'duree_validite' },
  { title: 'Expirable', key: 'expirable', type: Boolean },
  { title: 'Actions', slot: 'actions' },
];
const listeType = computed(() =>
  controleMedicalTypeStore.liste.sort((a, b) => a.tri - b.tri),
);

const { showModal } = useModalStore();
const awn = useNotification();
const ajoutType = () =>
  showModal({ component: 'ModalControleMedicalType', data: {} });
const updateType = (type) =>
  showModal({
    component: 'ModalControleMedicalType',
    data: { ...type },
  });
const deleteType = async (type) => {
  try {
    await controleMedicalTypeStore.removeType(type.id);
  } catch (res) {
    awn.alert(res.message || 'Erreur lors de la suppression');
  }
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Contrôles médicaux types</h3>
      <button type="button" class="btn btn-primary" @click="ajoutType">
        Ajouter une nouveau type
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeType"
        :fields="fields"
        no-data="Aucun contrôle médical type"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateType(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteType(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" /></button
        ></template>
      </base-table>
    </div>
  </div>
</template>
