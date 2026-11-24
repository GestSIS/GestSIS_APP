<script setup>
import { computed, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useNotification } from "../composables/useNotification.js";
import { useExerciceStore } from "../stores/exercice/Exercice.js";
import ExerciceComptable from "/src/components/exercice_comptable/ExerciceComptable.vue";
import { useExerciceComptableStore } from "../stores/comptabilite/ExerciceComptable.js";

const { id } = defineProps({
  id: {
    type: String,
    default: "new",
  },
});

const exerciceStore = useExerciceStore();
const exerciceComptableStore = useExerciceComptableStore();

const route = useRoute();
const router = useRouter();
const awn = useNotification();

await exerciceComptableStore.fetchExercicesComptables();
watchEffect(async () => {
  await exerciceStore.fetchExercices(exerciceComptableStore.activeId);
});

const newMode = computed(() => id === "new");
watchEffect(() => {
  if (id !== "new") {
    exerciceStore.selectExercice(parseInt(id));
    exerciceStore.fetchExercice(parseInt(id)).catch(() => {
      // Lien vers un exercice supprimé (favori, ancien onglet…) : retour à la liste.
      awn.alert("Cet exercice n'existe pas ou n'existe plus.");
      router.replace({ name: "exercices" });
    });
  } else {
    if (route.name != "exercice-details") {
      router.push({ name: "exercice-details", id: "new" });
    }
  }
});

const activeExerciceId = computed(() => exerciceStore.active.id);
const activeExerciceData = computed(() => exerciceStore.active.data);
const breadcrumbFinal = computed(() =>
  newMode.value
    ? "Nouveau"
    : new Date(activeExerciceData.value.date)?.toLocaleDateString("fr-CH") +
      " - " +
      activeExerciceData.value?.designation,
);
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <base-breadcrumb :items="[{ label: 'Exercices', to: { name: 'exercices' } }]">
          {{ breadcrumbFinal }}
        </base-breadcrumb>
      </div>
      <div class="col-sm-6 d-flex justify-content-end align-items-center gap-3">
        <record-navigation
          v-if="!newMode"
          filter-id="exercices"
          :items="exerciceStore.liste"
          :current-id="id"
          label="Exercice"
        />
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <base-navigation-tab
          v-if="!newMode"
          :routes="[
            {
              to: {
                name: 'exercice-details',
                params: { id: activeExerciceId },
              },
              texte: 'Informations',
            },
            {
              to: {
                name: 'exercice-presence',
                params: { id: activeExerciceId },
              },
              texte: 'Presences',
            },
            {
              to: { name: 'exercice-sms', params: { id: activeExerciceId } },
              texte: 'Sms',
            },
          ]"
        />

        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active mb-3" role="tabpanel">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
