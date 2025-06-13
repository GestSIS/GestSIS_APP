<script setup>
import { useStore } from 'vuex';
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import { computed, ref, watch } from 'vue';

const { id } = defineProps({
  id: {
    type: String,
    default: 'new',
  },
});

const loading = ref(true);
const store = useStore();

store.dispatch('fetchListeSapeur');
store.dispatch('fetchLocalites');
store.dispatch('fetchExerciceCategories');
store.dispatch('fetchExercicesComptables');
store.dispatch('fetchExcuseTypes');
store.dispatch('fetchHeuresExercice');
store.dispatch('fetchUnites');

const newMode = computed(() => id === 'new');

if (newMode.value) {
  store.dispatch('resetActiveExercice');
} else {
  store.dispatch('selectExercice', parseInt(id));
  store.dispatch('fetchExercice', parseInt(id)).then(() => {
    loading.value = false;
  });
  store.dispatch('fetchExerciceSapeurs', parseInt(id));
}
watch(
  () => id,
  () => {
    if (newMode.value) {
      store.dispatch('resetActiveExercice');
    } else {
      store.dispatch('selectExercice', parseInt(id));
      store.dispatch('fetchExercice', parseInt(id));
      store.dispatch('fetchExerciceSapeurs', parseInt(id));
      store.dispatch('fetchExerciceSms', parseInt(id));
    }
  },
);

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
