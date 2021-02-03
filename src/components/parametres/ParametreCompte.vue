<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Comptes</h3>
      <button type="button" class="btn btn-primary">
        Ajouter un compte
      </button>
    </div>
    <div class="card-body">
      <table id="indemnites-anuelles" class="table table-sm">
        <thead>
          <tr>
            <th>Numéro</th>
            <th>Désignation</th>
            <th>Type (Actif/Passif)</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in listeCompte" :key="c.id">
            <td>{{ c.numero }}</td>
            <td>{{ c.designation }}</td>
            <td class="text-center">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="actif"
                  :checked="c.actif"
                  disabled
                />
                <label class="custom-control-label" for="actif"></label>
              </div>
            </td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  disabled
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
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadIndemnites = store.dispatch('fetchIndemnitesTypes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');

  Promise.all([loadFrais, loadIndemnites, loadFonctions, loadComptes, loadUnites]).then(() => {
    next();
  });
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
      listeCompte: (state) => state.comptabilite.comptes,
    }),
  },
  methods: {
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
};
</script>

<style scoped></style>
