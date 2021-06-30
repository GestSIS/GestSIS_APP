<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Contrôles médicaux types</h3>
      <button type="button" class="btn btn-primary" @click="ajoutType">
        Ajouter une nouveau type
      </button>
    </div>
    <div class="card-body">
      <table id="exercice-categories" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Désignation</th>
            <th>Validité [ans]</th>
            <th class="text-center">Expirable</th>
            <th class="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in listeType" :key="t.id">
            <td>{{ t.tri }}</td>
            <td>{{ t.designation }}</td>
            <td>{{ t.duree_validite }}</td>
            <td class="text-center">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="expirable"
                  :checked="t.expirable"
                  disabled
                />
                <label class="custom-control-label" for="expirable"></label>
              </div>
            </td>
            <td>
              <div class="d-flex justify-content-center">
                <button
                  type="button"
                  class="btn btn-outline-primary border-0"
                  @click="updateType(t)"
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
  },
};
</script>

<style scoped></style>
