<script setup>
import { computed, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';

const { id } = defineProps({
  id: {
    type: String,
    default: 'new',
  },
});

const store = useStore();
const route = useRoute();

const newMode = computed(() => id === 'new');
watchEffect(() => {
  if (id !== 'new') {
    store.dispatch('selectExercice', parseInt(id));
    store.dispatch('fetchExercice', parseInt(id));
  } else {
    if (route.name != 'exercice-details') {
      router.push({ name: 'exercice-details', id: 'new' });
    }
  }
});

const activeExerciceId = computed(() => store.state.exercice.active.id);
const activeExerciceData = computed(() => store.state.exercice.active.data);
const breadcrumbFinal = computed(() =>
  newMode.value
    ? 'Nouveau'
    : new Date(activeExerciceData.value.date)?.toLocaleDateString('fr-CH') +
      ' - ' +
      activeExerciceData.value?.designation,
);
</script>

<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'exercices' }">Exercices</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ breadcrumbFinal }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
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
