<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Excuses types</h3>
      <button type="button" class="btn btn-primary" @click="ajoutExcuse()">
        Ajouter une excuse
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="listeExcuse"
        :fields="fields"
        no-data="Aucune excuse type"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateExcuse(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteExcuse(rowData)"
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
  const loadExcuses = store.dispatch('fetchExcuseTypes');

  Promise.all([loadExcuses]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreExcuseType',
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
        { title: 'Désignation', key: 'designation' },
        { title: 'Amende', key: 'amende', type: Boolean },
        {
          title: 'Disponibilité',
          key: 'statut',
          formatter: (statut) =>
            ({
              0: 'Désactivé',
              1: "Exercice + S'excuser",
              2: 'Exercice',
            }[statut]),
        },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeExcuse: (state) =>
        state.excuseType.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutExcuse() {
      this.SHOW_MODAL({ component: 'ModalExcuseType', data: {} });
    },
    updateExcuse(excuse) {
      this.SHOW_MODAL({ component: 'ModalExcuseType', data: { ...excuse } });
    },
    deleteExcuse(excuse) {
      this.$store
        .dispatch('removeExcuseType', excuse.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
