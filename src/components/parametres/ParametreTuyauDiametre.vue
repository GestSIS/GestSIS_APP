<script setup>
import { computed, inject } from 'vue';
import TagCouleur from '../materiel/TagCouleur.vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useTuyauDiametreStore } from '../../stores/materiel/TuyauDiametre';

const diametreStore = useTuyauDiametreStore();

await diametreStore.fetchTuyauDiametres();

const diametres = computed(() => diametreStore.liste);

const awn = inject('awn');
const { showModal } = useModalStore();

const ajout = () => {
  showModal({ component: 'ModalTuyauDiametre', data: {} });
};
const update = (elem) => {
  showModal({
    component: 'ModalTuyauDiametre',
    data: { ...elem },
  });
};
const remove = (elem) => {
  showModal({
    component: 'ModalConfirmation',
    data: {
      title: 'Voulez-vous vraiment supprimer ce diamètre ?',
      question: "Attention, la suppression d'un diamètre est irréversible !",
    },
    callback: (confirmed) => {
      if (confirmed) {
        diametreStore
          .removeTuyauDiametre(elem.id)
          .catch((error) =>
            awn.alert(error.message ?? 'Impossible de supprimer ce diamètre'),
          );
      }
    },
  });
};

const fields = [
  { title: 'Diamètre', key: 'diametre' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Couleurs</h3>
      <button type="button" class="btn btn-primary" @click="ajout">
        Ajouter
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="diametres"
        :fields="fields"
        :selectable="true"
        no-data="Aucune couleur"
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

<style scoped></style>
