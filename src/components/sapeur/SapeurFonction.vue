<script setup>
import { computed, ref, watch, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();
const loading = ref(true);

watchEffect(async () => {
  loading.value = true;
  await store.dispatch('fetchSapeurFonctions', store.state.sapeur.active.id);
  loading.value = false;
});
await store.dispatch('fetchFonctions');

const activeSapeurFonctions = computed(() =>
  store.state.sapeur.active.fonctions
    .sort((a, b) => b.debut.localeCompare(a.debut))
    .map((f) => ({
      ...f,
      fonction: store.state.fonction.liste.find(
        (fonction) => fonction.id == f.fonction_id,
      )?.nom,
    })),
);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

const { showModal, confirm } = useModalStore();

const newFonction = () => {
  showModal('ModalSapeurFonction');
};
const editFonction = (fonction) => {
  showModal({ component: 'ModalSapeurFonction', data: fonction });
};
const supprimerFonction = (fonction) =>
  confirm(
    'Voulez-vous vraiment supprimer cette fonction ?',

    "Attention, la suppression d'une fonction est irréversible ! Toutes les données de cette fonction seront perdues !",
  ).then(() => store.dispatch('removeSapeurFonction', fonction?.id));

const fields = [
  { title: 'Début', key: 'debut', type: Date },
  { title: 'Fin', key: 'fin', type: Date },
  { title: 'Fonction', key: 'fonction' },
  { title: 'Remarques', key: 'remarque' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Fonctions</h3>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-primary"
        @click="newFonction"
      >
        Ajouter une fonction
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :loading="loading"
        :fields="fields"
        :data="activeSapeurFonctions"
        no-data="Aucune fonction"
      >
        <template #actions="{ rowData }">
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editFonction(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimerFonction(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
