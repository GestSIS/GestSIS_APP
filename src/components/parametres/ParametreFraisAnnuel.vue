<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Frais annuels</h3>
      <button type="button" class="btn btn-primary" @click="ajoutFrais">
        Ajouter un type de frais annuel
      </button>
    </div>
    <div class="card-body">
      <table id="frais-annuels" class="table table-sm">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Fonction</th>
            <th>Montant</th>
            <th>Quantité</th>
            <th>Unité</th>
            <th>Compte</th>
            <th>Catégorie d'écriture</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in listeFraisAnnuel" :key="f.id">
            <td>{{ f.designation }}</td>
            <td>{{ fonction(f.fonction_id) }}</td>
            <td>{{ f.montant }}</td>
            <td>{{ f.quantite }}</td>
            <td>{{ unite(f.type_unite_id) }}</td>
            <td>{{ compte(f.compte_id) }}</td>
            <td>{{ categorie(f.ecriture_categorie_id) }}</td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateFrais(f)"
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
  const loadFrais = store.dispatch('fetchFraisTypes');
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
  name: 'ParametreFraisAnnuel',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeFraisAnnuel: (state) =>
        state.imputation.frais.annuels.sort((a, b) => a.tri - b.tri),
      listeFonction: (state) => state.fonction.liste,
      listeCompte: (state) => state.compte.liste,
      listeUnite: (state) => state.unite.liste,
      listeCategorie: (state) => state.ecritureCategorie.liste,
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutFrais() {
      this.SHOW_MODAL({ component: 'ModalFraisAnnuel', data: {} });
    },
    updateFrais(frais) {
      this.SHOW_MODAL({
        component: 'ModalFraisAnnuel',
        data: { ...frais },
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
    categorie(id) {
      return id
        ? this.listeCategorie.find((c) => c.id === id)?.designation
        : '';
    },
  },
};
</script>

<style scoped></style>
