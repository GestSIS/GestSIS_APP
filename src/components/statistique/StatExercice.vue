<template>
  <div class="row">
    <div class="col-12 col-md-6">
      <!-- /.card-header -->
      <div class="card card-primary card-outline mb-5">
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
        <div class="card-body">
          <base-table
            :fields="fields"
            :data="filteredCategories"
            no-data="Aucun exercice pour l'instant"
            :selectable="true"
            select-key="id"
            row-selected-class="table-primary"
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

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

import BaseTable from '@/components/table/BaseTable.vue';

async function loadData(_, next) {
  const loadExercies = store.dispatch('fetchListeExercice');
  const loadCategories = store.dispatch('fetchExerciceCategories');

  Promise.all([loadExercies, loadCategories]).then(() => {
    next();
  });
}

export default {
  name: 'StatExerciceSimple',
  components: {
    BaseTable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      allCategories: false,
      fields: [
        {
          title: 'Catégorie',
          key: 'designation',
        },
        {
          title: 'Amendable',
          key: 'amendable',
          type: 'boolean',
          titleClass: 'text-center',
          columnClass: 'text-center',
        },
        {
          title: 'Nombre',
          key: 'nb',
          titleClass: 'text-center',
          columnClass: 'text-center',
        },
      ],
    };
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
    filteredCategories() {
      return this.categories
        .filter((c) => this.allCategories || this.categoriesOccurence[c.id])
        .map((e) => ({ ...e, nb: this.categoriesOccurence[e.id] ?? 0 }));
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.$store.dispatch('fetchListeExercice');
    },
  },
};
</script>

<style lang="scss" scoped></style>
