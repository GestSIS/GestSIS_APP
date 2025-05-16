<script setup>
import { computed } from 'vue';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos';
import store from '/src/store/index';

const infosStore = useMesInfosStore();

await Promise.all([
  infosStore.fetchMesGroupes(),
  store.dispatch('fetchGroupes'),
]);

const groupes = computed(() =>
  infosStore.groupes
    .map((t) => ({
      ...t,
      designation: store.state.groupe.liste.find((e) => e.id == t.groupe_id)
        ?.designation,
      numero: store.state.groupe.liste.find((e) => e.id == t.groupe_id)?.no,
      type: store.state.groupe.liste.find((e) => e.id == t.groupe_id)?.type,
    }))
    .filter((g) => g.type),
);

const fields = [
  { title: 'Numéro', key: 'numero', columnClass: 'col-2' },
  { title: 'Désignation', key: 'designation' },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes groupes d'alarme</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="groupes"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun groupe"
      />
    </div>
  </div>
</template>

<style scoped></style>
