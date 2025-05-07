<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Matériel consommable et en prêt</h3>
      <button type="button" class="btn btn-primary" @click="ajoutMateriel()">
        Ajouter du matériel
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeMateriel"
        :fields="fields"
        no-data="Aucun materiel"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateMateriel(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteMateriel(rowData)"
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
  const loadMateriel = store.dispatch('fetchMateriels');

  Promise.all([loadMateriel]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreMateriel',
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
        { title: 'Actif', key: 'actif', type: Boolean },
        { title: 'Désignation', key: 'designation' },
        { title: 'Prix de forfait', key: 'forfait' },
        { title: "Prix de l'unité", key: 'unite' },
        { title: "Type d'unité", key: 'type_unite' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeMateriel: (state) =>
        state.materiel.liste
          .map((m) => ({
            ...m,
            type_unite:
              state.unite.liste.find((u) => u.id == m.type_unite_id)?.unite ??
              '-',
          }))
          .sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    ajoutMateriel() {
      this.SHOW_MODAL({ component: 'ModalMaterielIntervention', data: {} });
    },
    updateMateriel(materiel) {
      this.SHOW_MODAL({
        component: 'ModalMaterielIntervention',
        data: { ...materiel },
      });
    },
    deleteMateriel(materiel) {
      this.$store
        .dispatch('removeMateriel', materiel.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression'),
        );
    },
  },
};
</script>

<style scoped></style>
