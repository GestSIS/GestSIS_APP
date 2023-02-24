<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Contrôles médicaux types</h3>
      <button type="button" class="btn btn-primary" @click="ajoutType">
        Ajouter une nouveau type
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :data="listeType"
        :fields="fields"
        no-data="Aucun contrôle médical type"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateType(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteType(rowData)"
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
  const loadType = store.dispatch('fetchControlesMedicauxTypes');

  Promise.all([loadType]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreControleMedicalType',
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
        { title: 'Remarque', key: 'remarque' },
        { title: 'Validité [ans]', key: 'duree_validite' },
        { title: 'Expirable', key: 'expirable', type: Boolean },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeType: (state) =>
        state.controlesMedicauxType.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutType() {
      this.SHOW_MODAL({ component: 'ModalControleMedicalType', data: {} });
    },
    updateType(type) {
      this.SHOW_MODAL({
        component: 'ModalControleMedicalType',
        data: { ...type },
      });
    },
    deleteType(type) {
      this.$store
        .dispatch('removeControlesMedicauxTypes', type.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
