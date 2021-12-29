<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Traitement</h3>
      <button type="button" class="btn btn-primary" @click="ajoutTraitement()">
        Ajouter un traitement
      </button>
    </div>
    <div class="card-body">
      <table id="traitements" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Désignation</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listeTraitement.length">
            <td colspan="3">Aucun traitement</td>
          </tr>
          <tr v-for="t in listeTraitement" :key="t.id">
            <td>{{ t.tri }}</td>
            <td>{{ t.designation }}</td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateTraitement(t)"
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
  const loadTraitement = store.dispatch('fetchInterventionTraitements');

  Promise.all([loadTraitement]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTraitement',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  computed: {
    ...mapState({
      listeTraitement: (state) =>
        state.interventionTraitement.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutTraitement() {
      this.SHOW_MODAL({ component: 'ModalInterventionTraitement', data: {} });
    },
    updateTraitement(traitement) {
      this.SHOW_MODAL({
        component: 'ModalInterventionTraitement',
        data: { ...traitement },
      });
    },
  },
};
</script>

<style scoped></style>
