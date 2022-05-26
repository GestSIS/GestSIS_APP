<template>
  <div class="col-12 col-md-6 col-xl-4">
    <!-- /.card-header -->
    <div class="card card-primary card-outline mb-5">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats interventions</h3>
        <div class="form-check form-switch mb-2">
          <input type="checkbox" class="form-check-input" id="switch" v-model="allCategories" />
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
                <select class="form-select form-select-sm" id="select-categorie" v-model="displayKey">
                  <option v-for="(label, key) in grouping" :key="key" :value="key">
                    {{ label }}
                  </option>
                </select>
              </th>
              <th class="text-center">Nombre</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredData.length <= 0">
              <td colspan="2">Aucune intervention</td>
            </tr>
            <tr v-for="e in filteredData" :key="e.id">
              <td>{{ e.designation }}</td>
              <td class="text-center">
                {{ occurences[e.id] || 0 }}
              </td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th>Total :</th>
              <th class="text-center">{{ Object.values(occurences).reduce((partialSum, a) => partialSum + a, 0) }}</th>
            </tr>
          </thead>
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
  name: 'statInterventionBasic',
  data() {
    return {
      allCategories: false,
      displayKey: 'type_intervention_id',
      grouping: {
        type_intervention_id: 'Types',
        stat_federal_id: 'Statistiques fédéral',
        intervention_traitement_id: 'Traitements',
      },
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
      traitements: (state) => state.interventionTraitement.liste,
      statsFederal: (state) => state.statFederal.liste,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    occurences() {
      if (this.displayKey === "intervention_traitement_id") {
        return this.interventions
          .map((i) => i[this.displayKey])
          .reduce((prev, id) => ((prev[id] = ++prev[id] || 1), prev), {});
      } else {
        return this.interventions
          .map((i) => [i[this.displayKey], i.stat_nb])
          .reduce((prev, [id, stat_nb]) => ((prev[id] = (prev[id] ?? 0) + stat_nb), prev), {});
      }
    },
    groupingLabel() {
      return this.grouping[this.displayKey];
    },
    groupingData() {
      const mapping = {
        type_intervention_id: this.types,
        stat_federal_id: this.statsFederal,
        intervention_traitement_id: this.traitements,
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

<style lang="scss" scoped>
</style>
