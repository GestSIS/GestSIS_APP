<script setup>
import { computed, inject } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useTuyauDiametreStore } from '../../stores/materiel/TuyauDiametre';

const diametreStore = useTuyauDiametreStore();

await diametreStore.fetchTuyauDiametres();

const diametres = computed(() => diametreStore.liste);

const awn = inject('awn');
const { confirm, showModal } = useModalStore();

const ajout = () => {
  showModal({ component: 'ModalTuyauDiametre', data: {} });
};
const update = (elem) => {
  showModal({
    component: 'ModalTuyauDiametre',
    data: { ...elem },
  });
};
const remove = (elem) =>
  confirm(
    'Voulez-vous vraiment supprimer ce diamètre ?',
    "Attention, la suppression d'un diamètre est irréversible !",
  ).then(() =>
    diametreStore
      .removeTuyauDiametre(elem.id)
      .catch((error) =>
        awn.alert(error.message ?? 'Impossible de supprimer ce diamètre'),
      ),
  );

const fields = [
  { title: 'Diamètre', key: 'diametre' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Diamètres</h3>
      <button type="button" class="btn btn-primary" @click="ajout">
        Ajouter
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="diametres"
        :fields="fields"
        :selectable="true"
        no-data="Aucun diamètre"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="update(rowData)"
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
    </div>
  </div>
</template>
