<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Véhicules</h3>
      <button type="button" class="btn btn-primary" @click="ajouterVehicule()">
        Ajouter un véhicule
      </button>
    </div>
    <div class="card-body">
      <table id="vehicules" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th class="text-center">Actif</th>
            <th>Désignation</th>
            <th>Prix de forfait</th>
            <th>Prix de l'unité</th>
            <th>Type d'unité</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="v in listeVehicule" :key="v.id">
            <td>{{ v.tri }}</td>
            <td class="text-center">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="status"
                  :checked="v.status"
                  disabled
                />
                <label class="form-check-label" for="status"></label>
              </div>
            </td>
            <td>{{ v.designation }}</td>
            <td>{{ v.forfait }}</td>
            <td>{{ v.unite }}</td>
            <td>{{ unite(v.type_unite_id) }}</td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateVehicule(v)"
                >
                  <font-awesome-icon :icon="['far', 'edit']" />
                </button>
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  disabled
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

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
  computed: {
    ...mapState({
      listeUnite: (state) => state.unite.liste,
      listeVehicule: (state) =>
        state.vehicule.liste.sort((a, b) => a.tri - b.tri),
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
    unite(id) {
      return id ? this.listeUnite.find((u) => u.id === id)?.unite : '-';
    },
  },
};
</script>

<style scoped></style>
