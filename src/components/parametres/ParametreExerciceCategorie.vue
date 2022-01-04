<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Catégories</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCategorie()">
        Ajouter une catégorie
      </button>
    </div>
    <div class="card-body">
      <table id="exercice-categories" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Désignation</th>
            <th>Durée de base [min]</th>
            <th class="text-center">Amendable</th>
            <th class="text-center">Actif</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listeCategorie.length">
            <td colspan="6">Aucune catégorie</td>
          </tr>
          <tr v-for="c in listeCategorie" :key="c.id">
            <td>{{ c.tri }}</td>
            <td>{{ c.designation }}</td>
            <td>{{ c.duree_base }}</td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="amendable"
                :checked="c.amendable"
                disabled
              />
              <label class="form-check-label" for="amendable"></label>
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="statut"
                :checked="c.statut"
                disabled
              />
              <label class="form-check-label" for="statut"></label>
            </td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateCategorie(c)"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  disabled
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadCategories = store.dispatch('fetchExerciceCategories');

  Promise.all([loadCategories]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreExerciceCategorie',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeCategorie: (state) =>
        state.exerciceCategorie.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutCategorie() {
      this.SHOW_MODAL({ component: 'ModalExerciceCategorie', data: {} });
    },
    updateCategorie(categorie) {
      this.SHOW_MODAL({
        component: 'ModalExerciceCategorie',
        data: { ...categorie },
      });
    },
  },
};
</script>

<style scoped></style>
