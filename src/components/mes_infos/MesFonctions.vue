<script setup>
import { computed } from 'vue';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos';
import store from '/src/store/index';

const infosStore = useMesInfosStore();

await Promise.all([
  infosStore.fetchMesFonctions(),
  store.dispatch('fetchFonctions'),
]);

const fonctions = computed(() =>
  infosStore.fonctions
    .map((t) => ({
      ...t,
      fonction: store.state.fonction.liste.find((e) => e.id == t.fonction_id)
        ?.nom,
    }))
    .sort((a, b) => b.debut.localeCompare(a.debut)),
);

const fields = [
  { title: 'Début', key: 'debut', type: Date },
  { title: 'Fin', key: 'fin', type: Date },
  { title: 'Fonction', key: 'fonction' },
  { title: 'Remarques', key: 'remarques' },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes fonctions</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="fonctions"
        :selectable="true"
        :hide-download="true"
        no-data="Aucune fonction"
      />
    </div>
  </div>
</template>
