<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Incorporation / Sortie</h3>
    </div>
    <!-- /.card-header -->
    <!-- form start -->
    <form role="form">
      <div class="card-body">
        <base-table
          :fields="fields"
          :data="mutations"
          no-data="Aucune mutation"
        >
          <template #actions="{ rowData }">
            <button
              v-if="hasEditPermission"
              type="button"
              class="btn btn-outline-primary border-0"
              @click="editMutation(rowData)"
            >
              <font-awesome-icon :icon="['far', 'edit']" />
            </button>
            <button
              v-if="hasEditPermission"
              type="button"
              class="btn btn-outline-danger border-0"
              @click="removeMutation(rowData)"
            >
              <font-awesome-icon :icon="['far', 'trash-alt']" />
            </button>
          </template>
        </base-table>
        <button
          v-if="finServiceButtonState && hasEditPermission"
          type="button"
          class="btn btn-outline-primary"
          @click="finService"
        >
          <font-awesome-icon class="me-1" :icon="['fas', 'door-closed']" />Fin
          de service
        </button>
        <button
          v-else-if="hasEditPermission"
          type="button"
          class="btn btn-outline-primary"
          @click="incorporation"
        >
          <font-awesome-icon
            class="me-1"
            :icon="['fas', 'door-closed']"
          />Incorporation
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '/src/store/permissions.js';

import store from '/src/store/index';
async function loadData(routeTo, next) {
  const loadSapeurMutations = store.dispatch('fetchSapeurMutations');

  Promise.all([loadSapeurMutations]).then(() => {
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
        { title: 'Incorporation', key: 'incorporation', type: Date },
        { title: 'Sortie', key: 'sortie', type: Date },
        { title: 'Motif', key: 'motif' },
        { title: 'Localité', key: 'localite' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      mutations: (state) =>
        state.sapeur.active.mutations.map((m) => ({
          ...m,
          localite: state.localite.liste.find((l) => l.id == m.localite_id)
            ?.designation,
        })),
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
    }),
    finServiceButtonState() {
      return this.mutations.length > 0 && this.mutations.find((m) => !m.sortie);
    },
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurMutations', id);
    },
  },
  mounted() {
    this.$store.dispatch('fetchSapeurMutations', this.activeSapeurId);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL', 'HIDE_MODAL']),
    removeMutation(mutation) {
      this.$store.dispatch('removeMutation', mutation?.id);
    },
    editMutation(mutation) {
      this.$store.dispatch('updateActiveMutation', Object.assign({}, mutation));
      this.SHOW_MODAL('ModalMutation');
    },
    finService() {
      this.$store.dispatch(
        'updateActiveMutation',
        Object.assign(
          { action: 'finService' },
          this.mutations.find((m) => !m.sortie)
        )
      );
      this.SHOW_MODAL('ModalMutation');
    },
    incorporation() {
      this.$store.dispatch('resetActiveMutation');
      this.SHOW_MODAL('ModalMutation');
    },
  },
};
</script>

<style></style>
