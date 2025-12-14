<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useGroupeStore } from '../../stores/groupe/Groupe.js';

const sapeurStore = useSapeurStore();
const groupeStore = useGroupeStore();
const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await sapeurStore.fetchSapeurGroupes(sapeurStore.active.id);
  loading.value = false;
});
await groupeStore.fetchGroupes();

const groupes = computed(() => groupeStore.liste);
const activeSapeurGroupes = computed(() => sapeurStore.active.groupes);

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
