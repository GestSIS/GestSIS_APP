<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Téléphones</h3>
      <button type="button" class="btn btn-primary" @click="ajoutTelephone()">
        Ajouter une numéro
      </button>
    </div>
    <div class="card-body">
      <table id="telephones" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Nom</th>
            <th>Numéro</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in listeTelephone" :key="t.id">
            <td>{{ t.tri }}</td>
            <td>{{ t.nom }}</td>
            <td>{{ t.numero }}</td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateTelephone(t)"
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
  const loadAppel = store.dispatch('fetchTelephones');

  Promise.all([loadAppel]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTelephone',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeTelephone: (state) =>
        state.telephone.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutTelephone() {
      this.SHOW_MODAL({ component: 'ModalTelephone', data: {} });
    },
    updateTelephone(telephone) {
      this.SHOW_MODAL({ component: 'ModalTelephone', data: { ...telephone } });
    },
  },
};
</script>

<style scoped></style>
