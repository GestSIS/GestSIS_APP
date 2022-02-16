<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Heures additionnelles pour exercice</h3>
      <button type="button" class="btn btn-primary" @click="ajoutHeure">Ajouter une heure</button>
    </div>
    <div class="card-body">
      <table id="heures-anuelles" class="table table-sm">
        <thead>
          <tr>
            <th>Désignation</th>
            <th>Montant</th>
            <th>Unité</th>
            <th>Compte</th>
            <th>Type</th>
            <th>Catégorie</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!heureTypes.length">
            <td colspan="7">Aucune heure type</td>
          </tr>
          <tr v-for="h in heureTypes" :key="h.id">
            <td>{{ h.designation }}</td>
            <td>{{ h.montant }}</td>
            <td>{{ unite(h.type_unite_id) }}</td>
            <td>{{ compte(h.compte_id) }}</td>
            <td>{{ formatType(h.type) }}</td>
            <td>{{ categorie(h.ecriture_categorie_id) }}</td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateHeureType(h)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteHeureType(h)"
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
    deleteHeureType(heure) {
      this.$store
        .dispatch('removeExerciceHeure', heure.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
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
