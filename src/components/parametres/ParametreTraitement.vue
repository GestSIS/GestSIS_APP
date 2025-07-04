<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Traitement</h3>
      <button type="button" class="btn btn-primary" @click="ajoutTraitement()">
        Ajouter un traitement
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeTraitement"
        :fields="fields"
        no-data="Aucun traitement"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateTraitement(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteTraitement(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadTraitement = store.dispatch('fetchInterventionTraitements');

  Promise.all([loadTraitement]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTraitement',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Tri', key: 'tri' },
        { title: 'Désignation', key: 'designation' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeTraitement: (state) =>
        state.interventionTraitement.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    ajoutTraitement() {
      this.SHOW_MODAL({ component: 'ModalInterventionTraitement', data: {} });
    },
    updateTraitement(traitement) {
      this.SHOW_MODAL({
        component: 'ModalInterventionTraitement',
        data: { ...traitement },
      });
    },
    deleteTraitement(traitement) {
      this.$store
        .dispatch('removeInterventionTraitement', traitement.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression'),
        );
    },
  },
};
</script>
