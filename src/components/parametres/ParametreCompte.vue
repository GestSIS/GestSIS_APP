<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Comptes</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCompte">
        Ajouter un compte
      </button>
    </div>
    <div class="card-body table-responsive">
      <table id="indemnites-anuelles" class="table table-sm">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Désignation</th>
            <th>Produit / Charge</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listeCompte.length">
            <td colspan="4">Aucun compte</td>
          </tr>
          <tr v-for="c in listeCompte" :key="c.id">
            <td>{{ c.numero }}</td>
            <td>{{ c.designation }}</td>
            <!-- <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="produit"
                :checked="c.produit"
                disabled
              />
              <label class="form-check-label" for="produit"></label>
            </td>-->
            <td>{{ formatType(c.produit) }}</td>
            <td class="align-middle text-center">
              <button type="button" class="btn btn-outline-primary border-0" @click="updateCompte(c)">
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button type="button" class="btn btn-outline-danger border-0" @click="deleteCompte(c.id)">
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
  computed: {
    ...mapState({
      listeCompte: (state) =>
        state.compte.liste.sort((a, b) => a.numero.localeCompare(b.numero)),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    formatType(type) {
      return type ? 'Produit' : 'Charge';
    },
    // formatCategorie(type) {
    //   const mapping = {
    //     0: 'Autre',
    //     1: 'Solde',
    //     2: 'Indemnité',
    //     3: 'Frais forfaitaire',
    //     4: 'Frais effectif',
    //     5: 'Charges AVS/AC',
    //   }
    //   return mapping[type] || '';
    // },
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

<style scoped>
</style>
