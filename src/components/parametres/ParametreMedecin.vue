<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Médecins</h3>
      <button type="button" class="btn btn-primary" @click="ajoutMedecin">
        Ajouter un médecin
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table :data="listeMedecin" :fields="fields" no-data="Aucun médecin">
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateMedecin(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteMedecin(rowData)"
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
  const loadMedecin = store.dispatch('fetchMedecins');

  Promise.all([loadMedecin]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreMedecin',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Désignation', key: 'designation' },
        { title: 'Adresse', key: 'adresse' },
        { title: 'Localité', key: 'localite' },
        { title: 'Actif', key: 'actif', type: Boolean },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeMedecin: (state) =>
        state.medecin.liste
          .map((m) => ({
            ...m,
            localite: state.localite.liste.find((l) => l.id == m.localite_id)
              ?.designation,
          }))
          .sort((a, b) => a.designation.localeCompare(b.designation)),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutMedecin() {
      this.SHOW_MODAL({ component: 'ModalMedecin', data: {} });
    },
    updateMedecin(medecin) {
      this.SHOW_MODAL({ component: 'ModalMedecin', data: { ...medecin } });
    },
    deleteMedecin(medecin) {
      this.$store
        .dispatch('removeMedecin', medecin.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
