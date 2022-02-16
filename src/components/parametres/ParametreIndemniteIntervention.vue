<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Indemnités intervention</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">Ajouter une indemnité</button>
    </div>
    <div class="card-body">
      <table id="indemnites-anuelles" class="table table-sm">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Tarif</th>
            <th>Tarif min</th>
            <th>Pour</th>
            <th>Unité</th>
            <th>Phase</th>
            <th>Taux week-end</th>
            <th>Taux nuit</th>
            <th>Compte</th>
            <th>Catégorie d'écriture</th>
            <th>Type</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!indemnitesIntervention.length">
            <td colspan="11">Aucune indemnité</td>
          </tr>
          <tr v-for="i in indemnitesIntervention" :key="i.id">
            <td>{{ i.designation }}</td>
            <td>{{ i.tarif }}</td>
            <td>{{ i.tarif_min }}</td>
            <td>{{ i.tarif_min_pour }}</td>
            <td>{{ unite(i.type_unite_id) }}</td>
            <td>{{ phase(i.phase_id) }}</td>
            <td>{{ i.taux_weekend }}</td>
            <td>{{ i.taux_nuit }}</td>
            <td>{{ compte(i.compte_id) }}</td>
            <td>{{ categorie(i.ecriture_categorie_id) }}</td>
            <td>{{ formatType(i.type) }}</td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateIndemnite(i)"
              >
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
      indemnitesIntervention: (state) =>
        state.imputation.fraisIndemnites.interventions.sort((a, b) => a.tri - b.tri),
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
      phases: (state) => state.phaseType.liste,
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
    phase(id) {
      return id ? this.phases.find((u) => u.id === id)?.designation : '';
    },
    categorie(id) {
      return id ? this.categories.find((c) => c.id === id)?.designation : '';
    },
    formatType(type) {
      const mapping = {
        0: 'Autre',
        1: 'Solde',
        2: 'Indemnité',
        3: 'Frais forfaitaire',
        4: 'Frais effectif',
        5: 'Charges AVS/AC',
      }
      return mapping[type] || '';
    },
  },
};
</script>

<style scoped></style>
