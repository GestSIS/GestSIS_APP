<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Indemnités exercice</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">
        Ajouter une indemnite
      </button>
    </div>
    <div class="card-body">
      <table id="indemnites-anuelles" class="table table-sm">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Solde</th>
            <th>Solde min</th>
            <th>Pour</th>
            <th>Unité</th>
            <th>Indemnité</th>
            <th>Compte</th>
            <th>Par fonction</th>
            <th>Catégorie</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!indemnitesExercice.length">
            <td colspan="10">Aucune indemnité</td>
          </tr>
          <tr v-for="i in indemnitesExercice" :key="i.id">
            <td>{{ i.designation }}</td>
            <td>{{ i.solde }}</td>
            <td>{{ i.solde_min }}</td>
            <td>{{ i.solde_min_pour }}</td>
            <td>{{ unite(i.type_unite_id) }}</td>
            <td>{{ i.indemnite }}</td>
            <td>{{ compte(i.compte_id) }}</td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="par_fonction"
                :checked="i.par_fonction"
                disabled
              />
              <label class="form-check-label" for="par_fonction"></label>
            </td>
            <td>{{ categorie(i.ecriture_categorie_id) }}</td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateIndemnite(i)"
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
  const loadIndemnites = store.dispatch('fetchIndemnitesTypes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');

  Promise.all([
    loadFrais,
    loadIndemnites,
    loadFonctions,
    loadComptes,
    loadUnites,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreIndemniteExercice',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      indemnitesExercice: (state) =>
        state.imputation.indemnites.exercices.sort((a, b) => a.tri - b.tri),
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutIndemnite() {
      this.SHOW_MODAL({
        component: 'ModalIndemniteExercice',
        data: {},
        size: 1,
      });
    },
    updateIndemnite(indemnite) {
      this.SHOW_MODAL({
        component: 'ModalIndemniteExercice',
        data: { ...indemnite },
        size: 1,
      });
    },
    fonction(id) {
      return id ? this.fonctions.find((f) => f.id === id)?.abreviation : '';
    },
    compte(id) {
      if (!id) {
        return '';
      }
      const compte = this.comptes.find((f) => f.id === id);
      return `${compte?.numero} ${compte?.designation}`;
    },
    unite(id) {
      const unite = this.unites.find((u) => u.id === id);
      return (unite?.comptable ? 'par ' : '') + unite?.unite;
    },
    categorie(id) {
      return id ? this.categories.find((c) => c.id === id)?.designation : '';
    },
  },
};
</script>

<style scoped></style>
