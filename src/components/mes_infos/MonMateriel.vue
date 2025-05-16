<script setup>
import { computed } from 'vue';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos';
import { useMaterielTypeStore } from '../../stores/materiel/Type';

const infosStore = useMesInfosStore();
const materielTypeStore = useMaterielTypeStore();

await Promise.all([
  infosStore.fetchMonMateriel(),
  materielTypeStore.fetchMaterielTypes(),
]);

const materiels = computed(() =>
  infosStore.materiels.map((m) => ({
    ...m,
    materiel_type: materielTypeStore.liste.find(
      (t) => t.id == m.materiel_type_id,
    )?.designation,
  })),
);

const fields = [
  { title: 'Numéro', key: 'numero' },
  { title: 'Matériel', key: 'materiel_type' },
  { title: 'Taille', key: 'taille' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Attribution', key: 'attribution', type: Date },
];
</script>

<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mon matériel</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="materiels"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun matériel pour le moment"
      />
    </div>
  </div>
</template>

<style scoped></style>
