<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Heures additionnelles pour exercice</h3>
      <button type="button" class="btn btn-primary" @click="ajoutHeure">
        Ajouter une heure
      </button>
    </div>
    <div class="card-body">
      <table id="heures-anuelles" class="table table-sm">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Montant</th>
            <th>Unité</th>
            <th>Compte</th>
            <th>Catégorie</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!heureTypes.length">
            <td colspan="6">Aucune heure type</td>
          </tr>
          <tr v-for="i in heureTypes" :key="i.id">
            <td>{{ i.designation }}</td>
            <td>{{ i.montant }}</td>
            <td>{{ unite(i.type_unite_id) }}</td>
            <td>{{ compte(i.compte_id) }}</td>
            <td>{{ categorie(i.ecriture_categorie_id) }}</td>
            <td>TODO:</td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateHeureType(i)"
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
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');
  const loadHeures = store.dispatch('fetchHeuresExercice');

  Promise.all([loadFonctions, loadComptes, loadUnites, loadHeures]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreHeureExercice',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      heureTypes: (state) =>
        state.heureExercice.liste.sort((a, b) => a.tri - b.tri),
      fonctions: (state) => state.fonction.liste,
      comptes: (state) => state.compte.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.ecritureCategorie.liste,
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutHeure() {
      this.SHOW_MODAL({
        component: 'ModalHeureExercice',
        data: {},
      });
    },
    updateHeureType(heure) {
      this.SHOW_MODAL({
        component: 'ModalHeureExercice',
        data: { ...heure },
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
      return id ? this.unites.find((u) => u.id === id)?.unite : '';
    },
    categorie(id) {
      return id ? this.categories.find((c) => c.id === id)?.designation : '';
    },
  },
};
</script>

<style scoped></style>
