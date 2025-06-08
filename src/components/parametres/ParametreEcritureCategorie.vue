<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Catégories comptables</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCategorie">
        Ajouter une catégorie
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeCategorie"
        :fields="fields"
        no-data="Aucune catégorie"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateCategorie(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteCategorie(rowData.id)"
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
  const loadCategories = store.dispatch('fetchEcritureCategories');

  Promise.all([loadCategories]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreEcritureCategorie',
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
      listeCategorie: (state) =>
        state.ecritureCategorie.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    ajoutCategorie() {
      this.SHOW_MODAL({ component: 'ModalEcritureCategorie', data: {} });
    },
    updateCategorie(categorie) {
      this.SHOW_MODAL({
        component: 'ModalEcritureCategorie',
        data: { ...categorie },
      });
    },
    deleteCategorie(compteId) {
      this.$store
        .dispatch('removeEcritureCategorie', compteId)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression'),
        );
    },
  },
};
</script>

<style scoped></style>
