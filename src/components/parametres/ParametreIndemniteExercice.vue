<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Indemnités exercice</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">Ajouter une indemnite</button>
    </div>
    <div class="card-body table-responsive">
      <table id="indemnites-anuelles" class="table table-sm">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Unité</th>
            <th>Solde</th>
            <!-- <th>Solde min</th>
            <th>Pour</th>-->
            <th>Compte</th>
            <th>Indemnité</th>
            <!-- <th>Indemnité min</th>
            <th>Pour</th>-->
            <th>Compte</th>
            <th>Par fonction</th>
            <th>Catégorie</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!computedIndemnites.length">
            <td colspan="10">Aucune indemnité</td>
          </tr>
          <tr v-for="i in computedIndemnites" :key="i.id">
            <td>{{ i.designation }}</td>
            <td>{{ unite(i.type_unite_id) }}</td>
            <!-- <td v-if="!i.solde_undefined && i.min_solde == NaN">NaN</td> -->
            <td v-if="!i.solde_undefined">{{ i.total_solde }}</td>
            <td v-else>-</td>
            <!-- <td v-if="!i.solde_undefined && i.min_solde != NaN">{{ i.min_solde }}</td>
            <td v-else>-</td>
            <td v-if="!i.solde_undefined && i.min_solde != NaN">{{ i.min_solde_pour }}</td>
            <td v-else>-</td>-->
            <td v-if="!i.solde_undefined">
              {{
                  i.compte_solde_id ? compte(i.compte_solde_id) : 'Plus d\'un compte'
              }}
            </td>
            <td v-else>-</td>
            <!-- <td v-if="!i.indemnite_undefined && i.min_indemnite == NaN">NaN</td> -->
            <td v-if="!i.indemnite_undefined">{{ i.total_indemnite }}</td>
            <td v-else>-</td>
            <!-- <td v-if="!i.indemnite_undefined && i.min_indemnite != NaN">{{ i.min_indemnite }}</td>
            <td v-else>-</td>
            <td v-if="!i.indemnite_undefined && i.min_indemnite != NaN">{{ i.min_indemnite_pour }}</td>
            <td v-else>-</td>-->
            <td v-if="!i.indemnite_undefined">
              {{
                  i.compte_indemnite_id ? compte(i.compte_indemnite_id) : 'Plus d\'un compte'
              }}
            </td>
            <td v-else>-</td>
            <td class="text-center">
              <input type="checkbox" class="form-check-input" id="par_fonction" :checked="i.par_fonction" disabled />
              <label class="form-check-label" for="par_fonction"></label>
            </td>
            <td>{{ categorie(i.ecriture_categorie_id) }}</td>
            <td class="align-middle text-center">
              <button type="button" class="btn btn-outline-primary border-0" @click="updateIndemnite(i)">
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button type="button" class="btn btn-outline-danger border-0" disabled>
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
  const loadIndemnites = store.dispatch('fetchFraisIndemnitesTypes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');

  Promise.all([
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
        state.imputation.fraisIndemnites.exercices.sort((a, b) => a.tri - b.tri),
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
    computedIndemnites() {
      return this.indemnitesExercice.map(e => {
        const indemniteBase = e.fonctions.filter(f => !f.fonction_id);
        const soldes = indemniteBase.filter(e => e.type == 1)
        const indemnites = indemniteBase.filter(e => e.type == 2)

        const sumReducer = (acc, a) => acc + parseFloat(a);

        return {
          ...e,
          total_solde: soldes.map(e => e.tarif).reduce(sumReducer, 0.0),
          total_indemnite: indemnites.map(e => e.tarif).reduce(sumReducer, 0.0),
          solde_undefined: soldes.length == 0,
          min_solde: soldes.length == 0 ? 0 : soldes.length == 1 ? (soldes[0].tarif_min || 0) : NaN,
          min_solde_pour: soldes.length == 0 ? 0 : soldes.length == 1 ? (soldes[0].tarif_min_pour || 0) : NaN,
          compte_solde_id: soldes.length == 0 ? null : soldes.length == 1 ? soldes[0].compte_id : NaN,
          indemnite_undefined: indemnites.length == 0,
          min_indemnite: indemnites.length == 0 ? 0 : indemnites.length == 1 ? (indemnites[0].tarif_min || 0) : NaN,
          min_indemnite_pour: indemnites.length == 0 ? 0 : indemnites.length == 1 ? (indemnites[0].tarif_min_pour || 0) : NaN,
          compte_indemnite_id: indemnites.length == 0 ? null : indemnites.length == 1 ? indemnites[0].compte_id : NaN,
        }
      })
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutIndemnite() {
      this.SHOW_MODAL({
        component: 'ModalIndemniteExercice',
        data: {},
        size: 2,
      });
    },
    updateIndemnite(indemnite) {
      this.SHOW_MODAL({
        component: 'ModalIndemniteExercice',
        data: { ...indemnite },
        size: 2,
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

<style scoped>
</style>
