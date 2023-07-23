<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Fonctions</h3>
      <button type="button" class="btn btn-primary" @click="ajoutFonction()">
        Ajouter une fonction
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :data="listeFonction"
        :fields="fields"
        no-data="Aucune fonction"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateFonction(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteFonction(rowData)"
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
  const loadFonction = store.dispatch('fetchFonctions');

  Promise.all([loadFonction]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreFonction',
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
        { title: 'Abréviation', key: 'abreviation' },
        { title: 'Nom', key: 'nom' },
        { title: 'Cumulable', key: 'cumulable', type: Boolean },
        { title: 'Actif', key: 'actif', type: Boolean },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeFonction: (state) =>
        state.fonction.liste.sort((a, b) => b.tri - a.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutFonction() {
      this.SHOW_MODAL({ component: 'ModalFonction', data: {} });
    },
    updateFonction(fonction) {
      this.SHOW_MODAL({ component: 'ModalFonction', data: { ...fonction } });
    },
    deleteFonction(fonction) {
      this.$store
        .dispatch('removeFonction', fonction.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
