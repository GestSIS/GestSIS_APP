<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Matériel consommable et en prêt</h3>
      <button type="button" class="btn btn-primary" @click="ajoutMateriel()">
        Ajouter du matériel
      </button>
    </div>
    <div class="card-body">
      <table id="materiel" class="table table-sm">
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
          <tr v-for="m in listeMateriel" :key="m.id">
            <td>{{ m.tri }}</td>
            <td class="text-center">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="status"
                  :checked="m.status"
                  disabled
                />
                <label class="form-check-label" for="status"></label>
              </div>
            </td>
            <td>{{ m.designation }}</td>
            <td>{{ m.forfait }}</td>
            <td>{{ m.unite }}</td>
            <td>{{ unite(m.type_unite_id) }}</td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateMateriel(m)"
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
  computed: {
    ...mapState({
      listeUnite: (state) => state.unite.liste,
      listeMateriel: (state) =>
        state.materiel.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutMateriel() {
      this.SHOW_MODAL({ component: 'ModalMateriel', data: {} });
    },
    updateMateriel(materiel) {
      this.SHOW_MODAL({ component: 'ModalMateriel', data: { ...materiel } });
    },
    unite(id) {
      return id ? this.listeUnite.find((u) => u.id === id)?.unite : '-';
    },
  },
};
</script>

<style scoped></style>
