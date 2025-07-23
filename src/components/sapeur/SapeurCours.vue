<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();
const loading = ref(true);

watchEffect(async () => {
  loading.value = true;
  await store.dispatch('fetchSapeurCours', store.state.sapeur.active.id);
  loading.value = false;
});
await store.dispatch('fetchCours');

const activeSapeurCours = computed(() =>
  store.state.sapeur.active.cours
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((c) => ({
      ...c,
      designation: store.state.cours.liste.find(
        (cours) => cours.id == c.cours_id,
      )?.designation,
      localite: store.state.localite.liste.find((l) => l.id == c.localite_id)
        ?.designation,
    })),
);
const hasEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

const { showModal, confirm } = useModalStore();

const newCours = () => showModal('ModalSapeurCours');
const editCours = (cours) =>
  showModal({ component: 'ModalSapeurCours', data: cours });

const supprimerCours = (cours) =>
  confirm(
    'Voulez-vous vraiment supprimer ce cours ?',
    "Attention, la suppression d'un cours est irréversible ! Toutes les données de ce cours seront perdues !",
  ).then(() => store.dispatch('removeSapeurCours', cours?.id));

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Désignation', key: 'designation' },
  { title: 'Lieu', key: 'localite' },
  { title: 'Durée [jours]', key: 'duree' },
  { title: 'Actions', slot: 'actions' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Cours</h3>
      <button
        v-if="hasEditPermission"
        type="button"
        class="btn btn-primary"
        @click="newCours"
      >
        Ajouter un cours
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :loading="loading"
        :fields="fields"
        :data="activeSapeurCours"
        no-data="Aucun cours suivi"
      >
        <template #actions="{ rowData }">
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-primary border-0"
            @click="editCours(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            v-if="hasEditPermission"
            type="button"
            class="btn btn-outline-danger border-0"
            @click="supprimerCours(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>
