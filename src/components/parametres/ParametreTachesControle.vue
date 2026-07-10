<script setup>
import { useControleStore } from '../../stores/materiel/Controle.js';
import { useModalStore } from '../../stores/common/Modal.js';
import useNotification from '../../composables/useNotification.js';

const props = defineProps({
  controle: {
    type: Object,
    required: true,
  },
});

const store = useControleStore();
const { showModal, confirm } = useModalStore();
const awn = useNotification();

const tacheTypeLabel = (type) => (type === 'BOOLEAN' ? 'Booléen' : 'Numérique');

const fields = [
  { title: '#', key: 'order' },
  { title: 'Nom', key: 'nom' },
  { title: 'Description', key: 'description' },
  { title: 'Type', slot: 'type' },
  { title: 'Unité', key: 'unit' },
  { title: 'Min', key: 'value_min' },
  { title: 'Max', key: 'value_max' },
  { title: 'Actions', slot: 'actions' },
];

const edit = (tache) =>
  showModal({
    component: 'ModalControleTache',
    data: { controle_id: props.controle.id, ...tache },
  });

const remove = (tache) =>
  confirm('Supprimer cette tâche ?', `Supprimer la tâche "${tache.nom}" ?`)
    .then(() =>
      store.removeTache(props.controle.id, tache.id).catch((err) =>
        awn.alert(err.message ?? 'Impossible de supprimer cette tâche'),
      ),
    );
</script>

<template>
  <base-table
    :data="controle.taches ?? []"
    :fields="fields"
    no-data="Aucune tâche pour ce contrôle"
    :hide-download="true"
  >
    <template #type="{ rowData }">
      <span :class="rowData.type === 'BOOLEAN' ? 'badge bg-info' : 'badge bg-warning text-dark'">
        {{ tacheTypeLabel(rowData.type) }}
      </span>
    </template>
    <template #actions="{ rowData }">
      <button
        type="button"
        class="btn btn-outline-primary border-0"
        @click="edit(rowData)"
      >
        <font-awesome-icon :icon="['far', 'edit']" />
      </button>
      <button
        type="button"
        class="btn btn-outline-danger border-0"
        @click="remove(rowData)"
      >
        <font-awesome-icon :icon="['far', 'trash-alt']" />
      </button>
    </template>
  </base-table>
</template>
