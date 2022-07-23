<template>
  <div class="col-12 col-md-6 col-xl-4">
    <!-- /.card-header -->
    <div class="card card-primary card-outline mb-5">
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
      <div class="card-body">
        <table class="table table-sm">
          <thead>
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
          </thead>
          <tbody>
            <tr v-if="filteredData.length <= 0">
              <td colspan="2">Aucune intervention</td>
            </tr>
            <tr v-for="e in filteredData" :key="e.id">
              <td>{{ e.designation }}</td>
              <td class="text-center">
                {{ occurences[e.id]?.nb ?? 0 }}
              </td>
              <td
                v-if="displayKey != 'statistiquesInterventionTraitement'"
                class="text-center"
              >
                {{
                  Number.parseFloat(occurences[e.id]?.heures ?? 0)?.toFixed(2)
                }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th>Total :</th>
              <th class="text-center">
                {{
                  Object.values(occurences).reduce(
                    (partialSum, a) => partialSum + (a?.nb ?? 0),
                    0
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
                      0.0
                    )
                    ?.toFixed(2)
                }}
              </th>
            </tr>
          </tfoot>
        </table>
        <!-- <h4>TODO:</h4>
          <ul>
            <li>Graphique d'un simple tableau</li>
            <li>Exporter dans Excel</li>
            <li>Répartition des interventions durant l'année -> graph</li>
          </ul> -->
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadInterventions = store.dispatch('fetchListeIntervention');
  const loadTypes = store.dispatch('fetchTypeInterventions');
  const loadStats = store.dispatch('fetchStatFederals');
  const loadTraitements = store.dispatch('fetchInterventionTraitements');

  Promise.all([loadInterventions, loadTypes, loadStats, loadTraitements]).then(
    () => {
      next();
    }
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
        statistiquesStatFederal: 'Statistiques fédéral',
        statistiquesInterventionTraitement: 'Traitements',
      },
    };
  },
  watch: {
    activeExerciceComptableId() {
      this.$store.dispatch('fetchListeIntervention');
    },
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
      return this.groupingData.filter(
        (e) => this.allCategories || this.occurences[e.id]
      );
    },
  },
};
</script>

<style lang="scss" scoped></style>
