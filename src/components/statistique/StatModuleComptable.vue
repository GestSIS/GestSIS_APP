<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useExerciceComptableStore } from '../../stores/comptabilite/ExerciceComptable.js';
import { useStatistiqueStore } from '../../stores/statistique/Statistique.js';

const exerciceComptableStore = useExerciceComptableStore();
const statistiqueStore = useStatistiqueStore();

await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await statistiqueStore.fetchStatistiqueModuleComptable(
    exerciceComptableStore.activeId,
  );
  loading.value = false;
});

const allModule = ref(false);
const modules = [
  { designation: 'Exercice & séance', id: 1 },
  { designation: 'Intervention', id: 2 },
  { designation: 'Frais et indemnité annuel', id: 3 },
  { designation: 'Ecriture divers', id: 0 },
  { designation: 'Amende', id: 5 },
  { designation: 'Fiche de travail', id: 6 },
  { designation: 'Cours', id: 7 },
  { designation: 'Avs', id: 4 },
  // {designation: 'REMBOURSEMENT', id: 8},
];
const fields = [
  { title: 'Module', key: 'designation' },
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
    titleClass: 'text-end',
    columnClass: 'text-end',
  },
];

const stats = computed(() => statistiqueStore.modulesComptable);
const filteredData = computed(() => {
  const ids = new Set(stats.value.map((c) => c.module));
  return modules
    .filter((e) => allModule.value || ids.has(e.id))
    .map((c) => ({
      ...c,
      ...(stats.value.find((s) => s.module == c.id) ?? {}),
    }));
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats modules comptables</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-vehicule"
            v-model="allModule"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-vehicule"
            >Afficher les modules sans écriture</label
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
