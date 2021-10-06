<template>
  <div class="row">
    <div class="col-12 col-md-6">
      <!-- /.card-header -->
      <div class="card card-primary card-outline mb-5">
        <div class="card-header d-flex justify-content-between">
          <h3>Stats Exercice</h3>
          <div class="custom-control custom-switch mb-2">
            <input
              type="checkbox"
              class="custom-control-input"
              id="switch"
              v-model="allCategories"
            />
            <label class="custom-control-label" for="switch"
              >Afficher les catégories sans exercice</label
            >
          </div>
        </div>
        <div class="card-body">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th class="text-center">Amendable</th>
                <th class="text-center">Nombre</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="c in categories.filter(
                  (c) => allCategories || categoriesOccurence[c.id]
                )"
                :key="c.id"
              >
                <td>{{ c.designation }}</td>
                <td class="text-center">
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      :id="'amendable' + c.id"
                      :checked="c.amendable"
                      disabled
                    />
                    <label
                      class="custom-control-label"
                      :for="'amendable' + c.id"
                    ></label>
                  </div>
                </td>
                <td class="text-center">
                  {{ categoriesOccurence[c.id] || 0 }}
                </td>
              </tr>
            </tbody>
          </table>
          <h4>TODO:</h4>
          <ul>
            <li>Graphique d'un simple tableau</li>
            <li>Exporter dans Excel</li>
            <li>Répartition des exercices durant l'année -> graph</li>
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
  const loadExercies = store.dispatch('fetchListeExercice');
  const loadCategories = store.dispatch('fetchExerciceCategories');

  Promise.all([loadExercies, loadCategories]).then(() => {
    next();
  });
}

export default {
  name: 'stat-exercice-simple',
  data() {
    return {
      allCategories: false,
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
      this.$store.dispatch('fetchListeExercice');
    },
  },
  computed: {
    ...mapState({
      exercices: (state) => state.exercice.liste,
      categories: (state) => state.exerciceCategorie.liste,
      localites: (state) =>
        state.localite.liste.sort((a, b) =>
          a.designation.localeCompare(b.designation)
        ),
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    categoriesOccurence() {
      return this.exercices
        .map((e) => e.exercice_categorie_id)
        .reduce((prev, id) => ((prev[id] = ++prev[id] || 1), prev), {});
    },
  },
};
</script>

<style lang="scss" scoped>
</style>