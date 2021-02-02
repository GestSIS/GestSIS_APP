<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Médecins</h3>
          <button type="button" class="btn btn-primary">
            Ajouter un médecin
          </button>
        </div>
        <div class="card-body">
          <table id="excuses-types" class="table table-sm">
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Address</th>
                <th>Localité</th>
                <th class="text-center">Actif</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in listeMedecin" :key="m.id">
                <td>{{ m.designation }}</td>
                <td>{{ m.address }}</td>
                <td>{{ m.localite_id }}</td>
                <td class="text-center">
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      id="status"
                      :checked="m.status"
                      disabled
                    />
                    <label class="custom-control-label" for="status"></label>
                  </div>
                </td>
                <td>
                  <div class="d-flex justify-content-center">
                    <button
                      type="button"
                      class="btn btn-outline-primary border-0"
                      disabled
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
    </div>
    <div class="col-sm-12 col-xl-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Contrôles médicaux types</h3>
          <button type="button" class="btn btn-primary">
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
                      disabled
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
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadMedecin = store.dispatch('fetchMedecins');
  const loadType = store.dispatch('fetchControlesMedicauxTypes');

  Promise.all([loadMedecin, loadType]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabExercice',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  mounted() {},
  computed: {
    ...mapState({
      listeMedecin: (state) =>
        state.medecin.liste.sort((a, b) => a.tri - b.tri),
      listeType: (state) =>
        state.controlesMedicauxType.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
  watch: {},
};
</script>

<style scoped></style>
