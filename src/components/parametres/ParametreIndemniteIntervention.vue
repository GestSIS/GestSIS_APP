<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Indemnités intervention</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">
        Ajouter une indemnité
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
            <th>Phase</th>
            <th>Taux week-end</th>
            <th>Taux nuit</th>
            <th>Compte</th>
            <th>Catégorie d'écriture</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in listeIndemniteIntervention" :key="i.id">
            <td>{{ i.designation }}</td>
            <td>{{ i.solde }}</td>
            <td>{{ i.solde_min }}</td>
            <td>{{ i.solde_min_pour }}</td>
            <td>{{ unite(i.type_unite_id) }}</td>
            <td>{{ phase(i.phase_id) }}</td>
            <td>{{ i.taux_weekend }}</td>
            <td>{{ i.taux_nuit }}</td>
            <td>{{ compte(i.compte_id) }}</td>
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
  const loadPhases = store.dispatch('fetchPhaseTypes');

  Promise.all([
    loadFrais,
    loadIndemnites,
    loadFonctions,
    loadComptes,
    loadUnites,
    loadPhases,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreIndemniteIntervention',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeIndemniteIntervention: (state) =>
        state.imputation.indemnites.interventions.sort((a, b) => a.tri - b.tri),
      listeFonction: (state) => state.fonction.liste,
      listeCompte: (state) => state.compte.liste,
      listeUnite: (state) => state.unite.liste,
      listeCategorie: (state) => state.ecritureCategorie.liste,
      listePhase: (state) => state.phaseType.liste,
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutIndemnite() {
      this.SHOW_MODAL({
        component: 'ModalIndemniteIntervention',
        data: {},
      });
    },
    updateIndemnite(indemnite) {
      this.SHOW_MODAL({
        component: 'ModalIndemniteIntervention',
        data: { ...indemnite },
      });
    },
    fonction(id) {
      return id ? this.listeFonction.find((f) => f.id === id)?.abreviation : '';
    },
    compte(id) {
      if (!id) {
        return '';
      }
      const compte = this.listeCompte.find((f) => f.id === id);
      return `${compte?.numero} ${compte?.designation}`;
    },
    unite(id) {
      return id ? this.listeUnite.find((u) => u.id === id)?.unite : '';
    },
    phase(id) {
      return id ? this.listePhase.find((u) => u.id === id)?.designation : '';
    },
    categorie(id) {
      return id
        ? this.listeCategorie.find((c) => c.id === id)?.designation
        : '';
    },
  },
};
</script>

<style scoped></style>
