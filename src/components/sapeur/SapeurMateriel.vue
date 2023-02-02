<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Matériel personnel</h3>
    </div>
    <!-- /.card-header -->
    <!-- form start -->
    <form role="form">
      <div class="card-body">
        <base-table
          :fields="fields"
          :data="materiels"
          no-data="Aucun matériel distribué"
        >
          <template #actions>
            <div class="d-flex justify-content-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                disabled
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                v-if="materiels.length > 1"
                type="button"
                class="btn btn-outline-danger border-0"
                disabled
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </div>
          </template>
        </base-table>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '/src/store/permissions.js';

import store from '/src/store/index';
async function loadData(routeTo, next) {
  const loadMaterielTypes = store.dispatch('fetchMatPersoTypes');
  const loadMaterielCategories = store.dispatch('fetchMatPersoCategories');
  const loadSapeurMateriel = store.dispatch('fetchSapeurMateriels');

  Promise.all([
    loadMaterielTypes,
    loadMaterielCategories,
    loadSapeurMateriel,
  ]).then(() => {
    next();
  });
}

export default {
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Matériel type', key: 'materiel_type' },
        { title: 'Taille', key: 'taille' },
        { title: 'Quantité', key: 'quantite' },
        { title: 'Numéro', key: 'numero' },
        { title: 'Remarque', key: 'remarque' },
        { title: 'Attribution', key: 'attribution', type: Date },
        { title: 'Retour', key: 'retour', type: Date },
        // { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      types: (state) => state.matPersoType.liste,
      materiels: (state) =>
        state.sapeur.active.materiels.map((m) => ({
          quantite: 1,
          ...m.materiel,
          ...m,
          materiel_type: state.matPersoType.liste.find(
            (t) => t.id == m.materiel_type_id
          )?.designation,
        })),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.MATERIEL_PERSONNEL.MODIFICATION
        ),
    }),
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurMateriels', id);
    },
  },
  mounted() {
    this.$store.dispatch('fetchMatPersoTypes');
    this.$store.dispatch('fetchSapeurMateriels', this.activeSapeurId);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL', 'HIDE_MODAL']),
  },
};
</script>

<style></style>
