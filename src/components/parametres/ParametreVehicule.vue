<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Véhicules</h3>
      <button type="button" class="btn btn-primary" @click="ajouterVehicule()">
        Ajouter un véhicule
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table :data="vehicules" :fields="fields" no-data="Aucun véhicule">
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateVehicule(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteVehicule(rowData)"
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
  const loadVehicule = store.dispatch('fetchVehicules');

  Promise.all([loadVehicule]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreVehicule',
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
        { title: 'Actif', key: 'actif' },
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
      vehicules: (state) =>
        state.vehicule.liste
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
    ...mapMutations(['SHOW_MODAL']),
    ajouterVehicule() {
      this.SHOW_MODAL({ component: 'ModalVehicule', data: {} });
    },
    updateVehicule(vehicule) {
      this.SHOW_MODAL({ component: 'ModalVehicule', data: { ...vehicule } });
    },
    deleteVehicule(vehicule) {
      this.$store
        .dispatch('removeVehicule', vehicule.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
