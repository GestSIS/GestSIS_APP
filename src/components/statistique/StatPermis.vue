<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useBaseDataStore } from '../../stores/common/BaseData.js';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useStatistiqueStore } from '../../stores/statistique/Statistique.js';

const baseDataStore = useBaseDataStore();
const exerciceComptableStore = useExerciceComptableStore();
const statistiqueStore = useStatistiqueStore();

baseDataStore.fetchPermisType();
await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await statistiqueStore.fetchStatistiquePermis(
    exerciceComptableStore.activeId,
  );
  loading.value = false;
});

const allPermis = ref(false);
const fields = [
  { title: 'Permis', key: 'type' },
  { title: 'Nombre', key: 'quantite' },
];

const permis = computed(() => baseDataStore.permisTypes);
const sapeurPermis = computed(() => statistiqueStore.permis);
const occurences = computed(() => {
  return sapeurPermis.value.reduce(
    (prev, { permis_type_id, nb }) => (
      (prev[permis_type_id] = (prev[permis_type_id] ?? 0) + parseFloat(nb)),
      prev
    ),
    {},
  );
});
const filteredPermis = computed(() => {
  return permis.value
    .filter((e) => allPermis.value || occurences.value[e.id])
    .map((e) => ({ ...e, quantite: occurences.value[e.id] ?? 0 }));
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats permis</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-fonction"
            v-model="allPermis"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-fonction"
            >Afficher tous les permis disponibles</label
          >
        </div>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredPermis"
          no-data="Aucun permis"
          :selectable="true"
        />
      </div>
    </div>
  </div>
</template>
