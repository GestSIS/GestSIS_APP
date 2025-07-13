<script setup>
import { computed, inject } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useBatterieTypeStore } from '../../stores/materiel/BatterieType';

const batterieStore = useBatterieTypeStore();

await batterieStore.fetchBatterieTypes();
const batteries = computed(() => batterieStore.liste);

const awn = inject('awn');
const { confirm, showModal } = useModalStore();

const ajout = () => {
  showModal({ component: 'ModalBatterieType', data: {} });
};
const update = (elem) => {
  showModal({
    component: 'ModalBatterieType',
    data: { ...elem },
  });
};
const remove = (elem) =>
  confirm(
    'Voulez-vous vraiment supprimer cette batterie ?',
    "Attention, la suppression d'une batterie est irréversible !",
  ).then(() =>
    batterieStore
      .removeBatterieType(elem.id)
      .catch((error) =>
        awn.alert(error.message ?? 'Impossible de supprimer cette batterie'),
      ),
  );

const fields = [
  { title: 'Designation', key: 'nom' },
  { title: 'actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Batterie types</h3>
      <button type="button" class="btn btn-primary" @click="ajout">
        Ajouter
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="batteries"
        :fields="fields"
        :selectable="true"
        no-data="Aucune batterie type"
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
