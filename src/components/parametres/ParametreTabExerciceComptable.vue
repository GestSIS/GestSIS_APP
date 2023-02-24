<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Exercices comptables</h3>
      <button
        type="button"
        class="btn btn-primary"
        @click="newExerciceComptable"
      >
        Ajouter un exercice comptable
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :data="listeExerciceComptable"
        :fields="fields"
        no-data="Aucun exercice comptable"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateExerciceComptable(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <!-- TODO Implement Suppression exercice comptable -->
          <button
            v-if="false"
            type="button"
            class="btn btn-outline-danger border-0"
            disabled
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadExerciceComptable = store.dispatch('fetchExercicesComptables');

  Promise.all([loadExerciceComptable]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabExerciceComptable',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Année', key: 'annee' },
        { title: 'Désignation', key: 'designation' },
        { title: 'Début', key: 'debut', type: Date },
        { title: 'Fin', key: 'fin', type: Date },
        { title: 'Bouclé', key: 'boucle', type: Boolean },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeExerciceComptable: (state) =>
        state.exerciceComptable.liste.sort((a, b) => b.annee - a.annee),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    newExerciceComptable() {
      this.SHOW_MODAL({ component: 'ModalExerciceComptable', data: {} });
    },
    updateExerciceComptable(exercice) {
      this.SHOW_MODAL({
        component: 'ModalExerciceComptable',
        data: { ...exercice },
      });
    },
  },
};
</script>

<style scoped></style>
