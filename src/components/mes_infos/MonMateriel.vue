<script setup>
import { computed } from 'vue';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos';
import { useMaterielTypeStore } from '../../stores/materiel/Type';

const infosStore = useMesInfosStore();
const materielTypeStore = useMaterielTypeStore();

infosStore.fetchMonMateriel(),
  materielTypeStore.fetchMaterielTypes(),
  Promise.all([
    infosStore.fetchMonMateriel(),
    materielTypeStore.fetchMaterielTypes(),
  ]).then(() => {
    next();
  });

const materiels = computed(() =>
  infosStore.materiels.map((m) => ({
    quantite: 1,
    ...m.materiel,
    ...m,
    materiel_type: materielTypeStore.liste.find(
      (t) => t.id == m.materiel_type_id,
    )?.designation,
  })),
);

const fields = [
  { title: 'Matériel type', key: 'materiel_type' },
  { title: 'Taille', key: 'taille' },
  { title: 'Quantité', key: 'quantite' },
  { title: 'Numéro', key: 'numero' },
  { title: 'Remarque', key: 'remarque' },
  { title: 'Attribution', key: 'attribution', type: Date },
  { title: 'Retour', key: 'retour', type: Date },
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
