<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Catégories</h3>
      <button type="button" class="btn btn-primary" @click="ajoutCategorie()">
        Ajouter une catégorie
      </button>
    </div>
    <div class="card-body table-responsive">
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
            @click="deleteCategorie(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" /></button
        ></template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadCategories = store.dispatch('fetchExerciceCategories');

  Promise.all([loadCategories]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreExerciceCategorie',
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
        { title: 'Durée de base [min]', key: 'duree_base' },
        { title: 'Amendable', key: 'amendable', type: Boolean },
        { title: 'Actif', key: 'statut', type: Boolean },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeCategorie: (state) =>
        state.exerciceCategorie.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutCategorie() {
      this.SHOW_MODAL({ component: 'ModalExerciceCategorie', data: {} });
    },
    updateCategorie(categorie) {
      this.SHOW_MODAL({
        component: 'ModalExerciceCategorie',
        data: { ...categorie },
      });
    },
    deleteCategorie(categorie) {
      this.$store
        .dispatch('removeExerciceCategorie', categorie.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
