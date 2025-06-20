<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

store.dispatch('fetchExerciceCategories');
await store.dispatch('fetchExercicesComptables');

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch(
    'fetchListeExercice',
    store.state.exerciceComptable.activeId,
  );
  loading.value = false;
});

const allCategories = ref(false);
const fields = [
  { title: 'Catégorie', key: 'designation' },
  { title: 'Amendable', key: 'amendable', type: Boolean },
  {
    title: 'Nombre',
    key: 'nb',
    titleClass: 'text-center',
    columnClass: 'text-center',
  },
];

const exercices = computed(() => store.state.exercice.liste);
const categories = computed(() => store.state.exerciceCategorie.liste);

const categoriesOccurence = computed(() => {
  return exercices.value
    .map((e) => e.exercice_categorie_id)
    .reduce((prev, id) => ((prev[id] = ++prev[id] || 1), prev), {});
});
const filteredCategories = computed(() => {
  return categories.value
    .filter((c) => allCategories.value || categoriesOccurence.value[c.id])
    .map((e) => ({ ...e, nb: categoriesOccurence.value[e.id] ?? 0 }));
});
</script>

<template>
  <div class="row">
    <div class="col-12 col-md-6 mb-3">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3>Stats Exercice</h3>
          <div class="form-check form-switch mb-2">
            <input
              id="switch"
              v-model="allCategories"
              type="checkbox"
              class="form-check-input"
            />
            <label class="form-check-label" for="switch"
              >Afficher les catégories sans exercice</label
            >
          </div>
        </div>
        <div class="card-body table-responsive p-0">
          <base-table
            :loading="loading"
            :fields="fields"
            :data="filteredCategories"
            no-data="Aucun exercice pour l'instant"
            :selectable="true"
          >
            <template #foot>
              <tr>
                <th colspan="2">Total :</th>
                <th class="text-center">{{ exercices.length }}</th>
              </tr>
            </template>
          </base-table>
          <!-- <h4>TODO:</h4>
          <ul>
            <li>Graphique d'un simple tableau</li>
            <li>Répartition des exercices durant l'année -> graph</li>
          </ul> -->
        </div>
      </div>
    </div>
  </div>
</template>
