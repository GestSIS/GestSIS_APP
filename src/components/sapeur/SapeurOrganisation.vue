<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch('fetchSapeurGroupes', store.state.sapeur.active.id);
  loading.value = false;
});
await store.dispatch('fetchGroupes');

const groupes = computed(() => store.state.groupe.liste);
const activeSapeurGroupes = computed(() => store.state.sapeur.active.groupes);

const computedGroupes = computed(() => {
  return activeSapeurGroupes.value.map((groupe) => {
    let g = groupes.value.find((g) => g.id == groupe.groupe_id);
    return {
      id: groupe.id,
      designation: g?.designation,
      numero: g?.no || '',
    };
  });
});

const fields = [
  { title: 'Numéro', key: 'numero' },
  { title: 'Désignation', key: 'designation' },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Organisation</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :loading="loading"
        :fields="fields"
        :data="computedGroupes"
        no-data="Aucun groupe"
      />
    </div>
  </div>
</template>
