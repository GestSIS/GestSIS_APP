<template>
  <div class="row">
    <div class="col-12 col-md-6">
      <!-- /.card-header -->
      <div class="card card-primary card-outline mb-5">
        <div class="card-header d-flex justify-content-between">
          <h3>Stats interventions</h3>
          <div class="custom-control custom-switch mb-2">
            <input
              type="checkbox"
              class="custom-control-input"
              id="switch"
              v-model="allCategories"
            />
            <label class="custom-control-label" for="switch"
              >Afficher les
              {{
                displayKey == 'type_intervention_id'
                  ? 'types'
                  : 'statistiques fédéral'
              }}
              sans intervention</label
            >
          </div>
        </div>
        <div class="card-body">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>
                  <select
                    class="custom-select custom-select-sm"
                    id="validationCustom04"
                    v-model="displayKey"
                  >
                    <option value="type_intervention_id">Type</option>
                    <option value="stat_federal_id">
                      Statistiques fédéral
                    </option>
                  </select>
                </th>
                <th class="text-center">Nombre</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="e in groupingData.filter(
                  (e) => allCategories || occurences[e.id]
                )"
                :key="e.id"
              >
                <td>{{ e.designation }}</td>
                <td class="text-center">
                  {{ occurences[e.id] || 0 }}
                </td>
              </tr>
            </tbody>
          </table>
          <h4>TODO:</h4>
          <ul>
            <li>Graphique d'un simple tableau</li>
            <li>Exporter dans Excel</li>
            <li>Répartition des interventions durant l'année -> graph</li>
          </ul>
        </div>
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

  Promise.all([loadInterventions, loadTypes, loadStats]).then(() => {
    next();
  });
}

export default {
  name: 'stat-intervention',
  data() {
    return {
      allCategories: false,
      displayKey: 'type_intervention_id', // Ou 'stat_federal_id'
    };
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  watch: {
    activeExerciceComptableId(newValue, _) {
      this.$store.dispatch('fetchListeIntervention');
    },
  },
  computed: {
    ...mapState({
      interventions: (state) => state.intervention.liste,
      types: (state) => state.typeIntervention.liste,
      statsFederal: (state) => state.statFederal.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    occurences() {
      return this.interventions
        .map((e) => e[this.displayKey])
        .reduce((prev, id) => ((prev[id] = ++prev[id] || 1), prev), {});
    },
    groupingData() {
      return this.displayKey == 'type_intervention_id'
        ? this.types
        : this.statsFederal;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>