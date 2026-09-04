<script setup>
import { computed, ref, watchEffect } from "vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useTypeInterventionStore } from "../../stores/intervention/TypeIntervention.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";

const sapeurStore = useSapeurStore();
const localiteStore = useLocaliteStore();
const typeInterventionStore = useTypeInterventionStore();
const exerciceComptableStore = useExerciceComptableStore();

await Promise.all([
  exerciceComptableStore.fetchExercicesComptables(),
  localiteStore.fetchLocalites(),
  typeInterventionStore.fetchTypeInterventions(),
]);

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await sapeurStore.fetchSapeurInterventions({
    sapeurId: sapeurStore.active.id,
    exerciceComptableId: exerciceComptableStore.activeId,
  });
  loading.value = false;
});

const interventions = computed(() =>
  sapeurStore.active.interventions
    .map((i) => ({
      ...i.intervention,
      ...i,
      inter_debut: i.intervention.date_debut + " " + i.intervention.heure_debut,
      inter_fin: i.intervention.date_fin + " " + i.intervention.heure_fin,
      duree: Math.abs(new Date(i.debut) - new Date(i.fin)) / 36e5,
      localite: localiteStore.liste.find((l) => l.id == i.intervention.localite_id)?.designation,
      type: typeInterventionStore.liste.find((c) => c.id == i.intervention.type_intervention_id)
        ?.designation,
    }))
    .sort((i1, i2) => i1.debut.localeCompare(i2.debut)),
);

const computedInterventions = computed(() => {
  const inter = {};
  interventions.value.forEach((i) => {
    if (!inter[i.intervention_id]) {
      inter[i.intervention_id] = { ...i, presences: [i] };
    } else {
      inter[i.intervention_id].presences.push(i);
    }
  });
  return Object.values(inter);
});

const fields = [
  { title: "Date", key: "inter_debut", type: "datetime" },
  { title: "Type", key: "type" },
  { title: "Localite", key: "localite" },
  { title: "Lieu", key: "lieu" },
  { title: "Objet", key: "objet" },
];
const detailRowFields = [
  {
    title: "Début",
    key: "debut",
    type: "datetime",
    columnClass: "col-2",
  },
  { title: "Fin", key: "fin", type: "datetime", columnClass: "col-2" },
  { title: "Durée [heure]", key: "duree", columnClass: "col-2" },
  {
    title: "Piquet",
    key: "piquet",
    type: Boolean,
    titleClass: "text-center",
    columnClass: "text-center col-2",
  },
  {}, // Pour que la table soit compressée, ne pas supprimer
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Interventions</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :loading="loading"
        :fields="fields"
        :data="computedInterventions"
        :selectable="true"
        :hide-download="true"
        :detail-row-column="true"
        no-data="Aucune intervention pour le moment"
      >
        <template #detail-row="{ rowData }">
          <base-table
            :fields="detailRowFields"
            :data="rowData.presences"
            :hide-download="true"
            no-data="Aucune présence"
          />
        </template>
      </base-table>
    </div>
  </div>
</template>
