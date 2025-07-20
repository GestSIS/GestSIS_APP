<script setup>
import { computed, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

store.dispatch('fetchTypeInterventions');
store.dispatch('fetchStatFederals');
store.dispatch('fetchInterventionTraitements');
await store.dispatch('fetchExercicesComptables');

const loading = ref(true);
watchEffect(async () => {
  loading.value = true;
  await Promise.all([
    store.dispatch(
      'fetchStatistiqueTypeIntervention',
      store.state.exerciceComptable.activeId,
    ),
    store.dispatch(
      'fetchStatistiqueStatFederal',
      store.state.exerciceComptable.activeId,
    ),
    store.dispatch(
      'fetchStatistiqueTraitementIntervention',
      store.state.exerciceComptable.activeId,
    ),
  ]);
  loading.value = false;
});

const allCategories = ref(false);
const displayKey = ref('statistiquesTypeIntervention');
const grouping = {
  statistiquesTypeIntervention: 'Types',
  statistiquesStatFederal: 'Statistiques fédérale',
  statistiquesInterventionTraitement: 'Traitements',
};

const types = computed(() => store.state.typeIntervention.liste);
const traitements = computed(() => store.state.interventionTraitement.liste);
const statsFederal = computed(() => store.state.statFederal.liste);

const statistiquesStatFederal = computed(
  () => store.state.statistique.statFederal,
);
const statistiquesTypeIntervention = computed(
  () => store.state.statistique.typeIntervention,
);
const statistiquesInterventionTraitement = computed(
  () => store.state.statistique.interventionTraitement,
);

const occurences = computed(() => {
  const map = {
    statistiquesStatFederal: statistiquesStatFederal,
    statistiquesTypeIntervention: statistiquesTypeIntervention,
    statistiquesInterventionTraitement: statistiquesInterventionTraitement,
  };
  return map[displayKey.value].value.reduce((acc, e) => {
    acc[e.id] = e;
    return acc;
  }, {});
});
const groupingLabel = computed(() => grouping[displayKey.value]);
const groupingData = computed(() => {
  const mapping = {
    statistiquesTypeIntervention: types.value,
    statistiquesStatFederal: statsFederal.value,
    statistiquesInterventionTraitement: traitements.value,
  };
  return mapping[displayKey.value];
});
const filteredData = computed(() => {
  return groupingData.value
    .filter((e) => allCategories.value || occurences.value[e.id])
    .map((e) => ({
      ...e,
      nb: occurences.value[e.id]?.nb ?? 0,
      heures: occurences.value[e.id]?.heures ?? 0,
    }));
});
const fields = computed(() => {
  return [
    {
      title: grouping[displayKey.value],
      key: 'designation',
    },
    {
      title: 'Nombre',
      key: 'nb',
      titleClass: 'text-center',
      columnClass: 'text-center',
    },
    {
      title: 'Heures',
      key: 'heures',
      type: Number,
      titleClass: 'text-center',
      columnClass: 'text-center',
    },
  ].slice(0, displayKey.value != 'statistiquesInterventionTraitement' ? 3 : 2);
});
</script>

<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats interventions</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch"
            v-model="allCategories"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch">
            Afficher les {{ groupingLabel.toLowerCase() }} sans intervention
          </label>
        </div>
      </div>
      <div class="card-body table-responsive p-0">
        <base-table
          :loading="loading"
          :fields="fields"
          :data="filteredData"
          no-data="Aucune intervention"
          :selectable="true"
        >
          <template #head>
            <tr>
              <th>
                <select
                  id="select-categorie"
                  v-model="displayKey"
                  class="form-select form-select-sm"
                >
                  <option
                    v-for="(label, key) in grouping"
                    :key="key"
                    :value="key"
                  >
                    {{ label }}
                  </option>
                </select>
              </th>
              <th class="text-center">Nombre</th>
              <th
                v-if="displayKey != 'statistiquesInterventionTraitement'"
                class="text-center"
              >
                Heures
              </th>
            </tr>
          </template>
          <template #foot>
            <tr>
              <th>Total :</th>
              <th class="text-center">
                {{
                  Object.values(occurences).reduce(
                    (partialSum, a) => partialSum + (parseInt(a?.nb) ?? 0),
                    0,
                  )
                }}
              </th>
              <th
                v-if="displayKey != 'statistiquesInterventionTraitement'"
                class="text-center"
              >
                {{
                  Object.values(occurences)
                    .reduce(
                      (partialSum, a) =>
                        partialSum + Number.parseFloat(a?.heures ?? 0),
                      0.0,
                    )
                    ?.toLocaleString(undefined, { minimumFractionDigits: 2 })
                }}
              </th>
            </tr>
          </template>
        </base-table>
        <!-- <h4>TODO:</h4>
          <ul>
            <li>Graphique d'un simple tableau</li>
            <li>Répartition des interventions durant l'année -> graph</li>
          </ul> -->
      </div>
    </div>
  </div>
</template>
