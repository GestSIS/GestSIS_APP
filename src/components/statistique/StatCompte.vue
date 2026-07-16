<script setup>
import { computed, ref, watchEffect } from "vue";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useStatistiqueStore } from "../../stores/statistique/Statistique.js";

const exerciceComptableStore = useExerciceComptableStore();
const compteStore = useCompteStore();
const statistiqueStore = useStatistiqueStore();

compteStore.fetchComptes();
await exerciceComptableStore.fetchExercicesComptables();

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await statistiqueStore.fetchStatistiqueCompte(exerciceComptableStore.activeId);
  loading.value = false;
});

const allCompte = ref(false);
const fields = [
  { title: "Compte", key: "label" },
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
    columnClass: "text-end",
    titleClass: "text-end",
  },
];

const comptes = computed(() => compteStore.liste.slice().sort((a, b) => a.tri - b.tri));
const stats = computed(() => statistiqueStore.comptes);
const filteredData = computed(() => {
  const ids = new Set(stats.value.map((c) => c.compte_id));
  return comptes.value
    .filter((e) => allCompte.value || ids.has(e.id))
    .map((c) => ({
      ...c,
      ...stats.value.find((s) => s.compte_id == c.id),
    }));
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats comptes</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-vehicule"
            v-model="allCompte"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-vehicule"
            >Afficher les comptes sans écriture</label
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
                    .reduce(
                      (acc, a) => acc + ((a.produit ? -1 : 1) * parseFloat(a.total) ?? 0),
                      0.0,
                    )
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
