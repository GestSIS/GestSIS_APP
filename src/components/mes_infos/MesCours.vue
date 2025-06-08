<script setup>
import { computed } from 'vue';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos';
import store from '/src/store/index';

const infosStore = useMesInfosStore();

await Promise.all([
  infosStore.fetchMesCours(),
  store.dispatch('fetchLocalites'),
  store.dispatch('fetchCours'),
]);

const fields = [
  { title: 'Date', key: 'date', type: Date },
  { title: 'Désignation', key: 'designation' },
  { title: 'Lieu', key: 'localite' },
  { title: 'Durée [jours]', key: 'duree' },
];

const cours = computed(() =>
  infosStore.cours
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
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes cours</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="cours"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun cours"
      />
    </div>
  </div>
</template>

<style scoped></style>
