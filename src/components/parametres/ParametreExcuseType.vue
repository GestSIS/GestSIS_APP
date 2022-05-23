<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Excuses type</h3>
      <button type="button" class="btn btn-primary" @click="ajoutExcuse()">
        Ajouter une excuse
      </button>
    </div>
    <div class="card-body table-responsive">
      <table id="excuses-types" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Abréviation</th>
            <th>Désignation</th>
            <th class="text-center">Amende</th>
            <th class="text-center">Actif</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!listeExcuse.length">
            <td colspan="6">Aucune excuse type</td>
          </tr>
          <tr v-for="e in listeExcuse" :key="e.id">
            <td>{{ e.tri }}</td>
            <td>{{ e.abreviation }}</td>
            <td>{{ e.designation }}</td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="amende"
                :checked="e.amende"
                disabled
              />
              <label class="form-check-label" for="amende"></label>
            </td>
            <td class="text-center">
              <input
                type="checkbox"
                class="form-check-input"
                id="statut"
                :checked="e.statut"
                disabled
              />
              <label class="form-check-label" for="statut"></label>
            </td>
            <td class="align-middle text-center">
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateExcuse(e)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteExcuse(e)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
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
