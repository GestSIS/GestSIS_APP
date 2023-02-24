<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Comptes</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCompte">
        Ajouter un compte
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table :data="listeCompte" :fields="fields" no-data="Aucun compte">
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateCompte(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteCompte(rowData?.id)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadIndemnites = store.dispatch('fetchFraisIndemnitesTypes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');

  Promise.all([loadIndemnites, loadFonctions, loadComptes, loadUnites]).then(
    () => {
      next();
    }
  );
}

export default {
  name: 'ParametreCompte',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Numéro', key: 'numero' },
        { title: 'Désignation', key: 'designation' },
        { title: 'Produit / Charge', key: 'typeLabel' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeCompte: (state) =>
        state.compte.liste
          .map((c) => ({ ...c, typeLabel: c.produit ? 'Produit' : 'Charge' }))
          .sort((a, b) => a.numero.localeCompare(b.numero)),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutCompte() {
      this.SHOW_MODAL({ component: 'ModalCompte', data: {} });
    },
    updateCompte(compte) {
      this.SHOW_MODAL({ component: 'ModalCompte', data: { ...compte } });
    },
    deleteCompte(compteId) {
      this.$store
        .dispatch('removeCompte', compteId)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
