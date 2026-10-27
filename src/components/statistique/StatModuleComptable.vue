<script setup>
import { computed, ref, watchEffect } from "vue";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useStatistiqueStore } from "../../stores/statistique/Statistique.js";

const exerciceComptableStore = useExerciceComptableStore();
const statistiqueStore = useStatistiqueStore();

await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await statistiqueStore.fetchStatistiqueModuleComptable(exerciceComptableStore.activeId);
  loading.value = false;
});

const allModule = ref(false);
// Les fiches de travail (module 6) sont séparées selon l'événement lié (`lien` de l'API),
// et placées sous leur domaine
const modules = [
  { designation: "Exercice & séance", module: 1, lien: null },
  { designation: "Exercice & séance - Fiches de travail", module: 6, lien: "exercice" },
  { designation: "Intervention", module: 2, lien: null },
  { designation: "Intervention - Fiches de travail", module: 6, lien: "intervention" },
  { designation: "Fiches de travail", module: 6, lien: null },
  { designation: "Frais et indemnité annuel", module: 3, lien: null },
  { designation: "Ecriture divers", module: 0, lien: null },
  { designation: "Amende", module: 5, lien: null },
  { designation: "Cours", module: 7, lien: null },
  { designation: "Avs", module: 4, lien: null },
  // {designation: 'REMBOURSEMENT', module: 8, lien: null},
];
const fields = [
  { title: "Module", key: "designation" },
  {
    title: "Nb écritures",
    key: "nb",
    columnClass: "text-end",
    titleClass: "text-end",
  },
  {
    title: "Total",
    key: "total",
    type: Number,
    titleClass: "text-end",
    columnClass: "text-end",
  },
];

const stats = computed(() => statistiqueStore.modulesComptable);
const statDe = (ligne) =>
  stats.value.find((s) => s.module == ligne.module && (s.lien ?? null) === ligne.lien);
const filteredData = computed(() =>
  modules
    .filter((ligne) => allModule.value || statDe(ligne))
    // id unique par ligne (clé de base-table), le module 6 apparaissant trois fois
    .map((ligne) => ({ ...ligne, ...statDe(ligne), id: ligne.module + "-" + (ligne.lien ?? "") })),
);
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats modules comptables</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-module-comptable"
            v-model="allModule"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-module-comptable"
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
                {{ filteredData.reduce((acc, a) => acc + (parseInt(a.nb) ?? 0), 0) }}
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
