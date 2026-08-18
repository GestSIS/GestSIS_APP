<script setup>
import { computed, ref } from "vue";
import { watchEffect } from "vue";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useStatistiqueStore } from "../../stores/statistique/Statistique.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";

const sapeurStore = useSapeurStore();
const localiteStore = useLocaliteStore();
const exerciceComptableStore = useExerciceComptableStore();
const statistiqueStore = useStatistiqueStore();

localiteStore.fetchLocalites();
sapeurStore.fetchListeSapeur();
await exerciceComptableStore.fetchExercicesComptables();

watchEffect(() =>
  statistiqueStore.fetchStatistiquePresenceIntervention(exerciceComptableStore.activeId),
);
const allSapeurs = ref(false);
const fields = [
  { title: "Sapeur", key: "nom_prenom" },
  { title: "Nombre", key: "nb" },
  { title: "Durée [h]", key: "duree" },
];

const sapeurs = computed(() => sapeurStore.liste);
const presences = computed(() =>
  statistiqueStore.presencesIntervention.map((p) => ({
    ...p,
    duree: (new Date(p.fin).getTime() - new Date(p.debut).getTime()) / (1000 * 60 * 60),
  })),
);
const computedData = computed(() => {
  const reducedPresences = presences.value.reduce((acc, val) => {
    const { nb, duree } = acc[val.sapeur_id] ?? { nb: 0, duree: 0 };
    acc[val.sapeur_id] = { nb: nb + 1, duree: duree + val.duree };
    return acc;
  }, {});

  return sapeurs.value
    .map((s) => ({
      ...s,
      ...(reducedPresences[s.id] ?? { duree: 0, nb: 0 }),
    }))
    .filter((s) => (allSapeurs.value && s.actif) || s.duree !== 0);
});
</script>

<template>
  <div class="row">
    <div class="col-12 col-xl-6 mb-3">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h4>Filtres</h4>
        </div>
        <form class="card-body p-2 pb-0">
          <div class="form-check form-switch mb-2">
            <input
              id="switch-fonction"
              v-model="allSapeurs"
              type="checkbox"
              class="form-check-input"
            />
            <label class="form-check-label" for="switch-fonction"
              >Afficher les sapeurs sans interventions</label
            >
          </div>
        </form>
      </div>
    </div>
    <div class="col-12 mb-3">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3>Présences aux interventions</h3>
        </div>
        <div class="card-body table-responsive p-0">
          <base-table
            ref="table"
            :fields="fields"
            :data="computedData"
            :selectable="true"
            no-data="Aucune intervention"
          />
        </div>
      </div>
    </div>
  </div>
</template>
