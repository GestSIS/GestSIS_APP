<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Catégories</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCategorie">
        Ajouter une catégorie
      </button>
    </div>
    <div class="card-body table-responsive">
      <table id="exercice-categories" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Désignation</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listeCategorie.length">
            <td colspan="8">Aucune catégorie</td>
          </tr>
          <tr v-for="c in listeCategorie" :key="c.id">
            <td>{{ c.tri }}</td>
            <td>{{ c.designation }}</td>
            <td class="align-middle text-center">
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
                @click="deleteCategorie(c.id)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
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
  const loadCategories = store.dispatch('fetchEcritureCategories');

  Promise.all([loadCategories]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreEcritureCategorie',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeCategorie: (state) =>
        state.ecritureCategorie.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutCategorie() {
      this.SHOW_MODAL({ component: 'ModalEcritureCategorie', data: {} });
    },
    updateCategorie(categorie) {
      this.SHOW_MODAL({
        component: 'ModalEcritureCategorie',
        data: { ...categorie },
      });
    },
    deleteCategorie(compteId) {
      this.$store
        .dispatch('removeEcritureCategorie', compteId)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
