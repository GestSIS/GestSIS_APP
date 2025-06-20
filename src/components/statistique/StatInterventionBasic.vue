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

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadInterventions = store.dispatch('fetchListeIntervention');
  const loadTypes = store.dispatch('fetchTypeInterventions');
  const loadStats = store.dispatch('fetchStatFederals');
  const loadTraitements = store.dispatch('fetchInterventionTraitements');

  Promise.all([loadInterventions, loadTypes, loadStats, loadTraitements]).then(
    () => {
      next();
    },
  );
}

export default {
  name: 'StatInterventionBasic',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      allCategories: false,
      displayKey: 'statistiquesTypeIntervention',
      grouping: {
        statistiquesTypeIntervention: 'Types',
        statistiquesStatFederal: 'Statistiques fédérale',
        statistiquesInterventionTraitement: 'Traitements',
      },
    };
  },
  computed: {
    ...mapState({
      interventions: (state) => state.intervention.liste,
      types: (state) => state.typeIntervention.liste,
      traitements: (state) => state.interventionTraitement.liste,
      statsFederal: (state) => state.statFederal.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      statistiquesStatFederal: (state) => state.statistique.statFederal,
      statistiquesTypeIntervention: (state) =>
        state.statistique.typeIntervention,
      statistiquesInterventionTraitement: (state) =>
        state.statistique.interventionTraitement,
    }),
    occurences() {
      return this[this.displayKey].reduce((acc, e) => {
        acc[e.id] = e;
        return acc;
      }, {});
    },
    groupingLabel() {
      return this.grouping[this.displayKey];
    },
    groupingData() {
      const mapping = {
        statistiquesTypeIntervention: this.types,
        statistiquesStatFederal: this.statsFederal,
        statistiquesInterventionTraitement: this.traitements,
      };
      return mapping[this.displayKey];
    },
    filteredData() {
      return this.groupingData
        .filter((e) => this.allCategories || this.occurences[e.id])
        .map((e) => ({
          ...e,
          nb: this.occurences[e.id]?.nb ?? 0,
          heures: this.occurences[e.id]?.heures ?? 0,
        }));
    },
    fields() {
      return [
        {
          title: this.grouping[this.displayKey],
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
      ].slice(
        0,
        this.displayKey != 'statistiquesInterventionTraitement' ? 3 : 2,
      );
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.$store.dispatch('fetchListeIntervention');
    },
  },
};
</script>
