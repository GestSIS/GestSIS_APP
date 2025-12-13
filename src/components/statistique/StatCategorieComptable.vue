<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useEcritureCategorieStore } from '../../stores/comptabilite/EcritureCategorie.js';
import { useStatistiqueStore } from '../../stores/statistique/Statistique.js';

const exerciceComptableStore = useExerciceComptableStore();
const ecritureCategorieStore = useEcritureCategorieStore();
const statistiqueStore = useStatistiqueStore();

ecritureCategorieStore.fetchEcritureCategories();
await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await statistiqueStore.fetchStatistiqueCategorieComptable(
    exerciceComptableStore.activeId,
  );
  loading.value = false;
});

const allCategorie = ref(false);
const fields = [
  { title: 'Catégorie comptable', key: 'designation' },
  {
    title: 'Nb écritures',
    key: 'nb',
    columnClass: 'text-end',
    titleClass: 'text-end',
  },
  {
    title: 'Total',
    key: 'total',
    type: Number,
    columnClass: 'text-end',
    titleClass: 'text-end',
  },
];

const categories = computed(() =>
  ecritureCategorieStore.liste.sort((a, b) => a.tri - b.tri),
);
const stats = computed(() => statistiqueStore.categoriesComptable);
const filteredData = computed(() => {
  const ids = new Set(stats.value.map((c) => c.ecriture_categorie_id));
  return categories.value
    .filter((e) => allCategorie.value || ids.has(e.id))
    .map((c) => ({
      ...c,
      ...(stats.value.find((s) => s.ecriture_categorie_id == c.id) ?? {}),
    }));
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats catégories comptables</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-vehicule"
            v-model="allCategorie"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-vehicule"
            >Afficher les catégories sans écriture</label
          >
        </div>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredData"
          no-data="Aucun écriture"
          :selectable="true"
        >
          <template #foot>
            <tr>
              <th>Total :</th>
              <th class="text-end">
                {{
                  filteredData.reduce(
                    (acc, a) => acc + (parseInt(a.nb) ?? 0),
                    0,
                  )
                }}
              </th>
              <th class="text-end">
                {{
                  filteredData
                    .reduce((acc, a) => acc + (parseFloat(a.total) ?? 0), 0.0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2 })
                }}
              </th>
            </tr>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>
