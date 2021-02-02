<template>
  <div class="row">
    <div class="col-sm-12 col-xl-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Véhicules</h3>
          <button type="button" class="btn btn-primary">
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
                  <div class="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      class="custom-control-input"
                      id="status"
                      :checked="v.status"
                      disabled
                    />
                    <label class="custom-control-label" for="status"></label>
                  </div>
                </td>
                <td>{{ v.designation }}</td>
                <td>{{ v.forfait }}</td>
                <td>{{ v.unite }}</td>
                <td>{{ v.type_unite_id }}</td>
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
          <h3 class="card-title">Matériel</h3>
          <button type="button" class="btn btn-primary">
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
                <td>{{ m.designation }}</td>
                <td>{{ m.forfait }}</td>
                <td>{{ m.unite }}</td>
                <td>{{ m.type_unite_id }}</td>
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
    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Mission</h3>
          <button type="button" class="btn btn-primary">
            Ajouter une mission
          </button>
        </div>
        <div class="card-body">
          <table id="missions" class="table table-sm">
            <thead>
              <tr>
                <th>Titre</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in listeMission" :key="m.id">
                <td>{{ m.titre }}</td>
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
    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Téléphones</h3>
          <button type="button" class="btn btn-primary">
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
    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Traitement</h3>
          <button type="button" class="btn btn-primary">
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
              <tr v-for="t in listeTraitement" :key="t.id">
                <td>{{ t.tri }}</td>
                <td>{{ t.designation }}</td>
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
    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Type d'intervention</h3>
          <button type="button" class="btn btn-primary">Ajouter un type</button>
        </div>
        <div class="card-body">
          <table id="type-intervention" class="table table-sm">
            <thead>
              <tr>
                <th>Tri</th>
                <th>Type d'intervention</th>
                <th>Statistiques</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in listeType" :key="t.id">
                <td>{{ t.tri }}</td>
                <td>{{ t.designation }}</td>
                <td>{{ statistique(t.stat_intervention_id) }}</td>
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
    <div class="col-sm-12 col-xl-6">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Statistiques</h3>
          <button type="button" class="btn btn-primary">
            Ajouter un type de statistique
          </button>
        </div>
        <div class="card-body">
          <table id="statistiques" class="table table-sm">
            <thead>
              <tr>
                <th>Tri</th>
                <th>Désignation</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in listeStat" :key="s.id">
                <td>{{ s.tri }}</td>
                <td>{{ s.designation }}</td>
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
  const loadVehicule = store.dispatch('fetchVehicules');
  const loadMateriel = store.dispatch('fetchMateriels');
  const loadMission = store.dispatch('fetchMissions');
  const loadAppel = store.dispatch('fetchTelephones');
  const loadStatIntervention = store.dispatch('fetchStatInterventions');
  const loadTypeIntervention = store.dispatch('fetchTypeInterventions');
  const loadTraitement = store.dispatch('fetchInterventionTraitements');

  Promise.all([
    loadVehicule,
    loadMateriel,
    loadMission,
    loadAppel,
    loadStatIntervention,
    loadTypeIntervention,
    loadTraitement,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabIntervention',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  mounted() {},
  computed: {
    ...mapState({
      listeVehicule: (state) =>
        state.vehicule.liste.sort((a, b) => a.tri - b.tri),
      listeMateriel: (state) =>
        state.materiel.liste.sort((a, b) => a.tri - b.tri),
      listeTelephone: (state) =>
        state.telephone.liste.sort((a, b) => a.tri - b.tri),
      listeMission: (state) =>
        state.mission.liste.sort((a, b) => a.tri - b.tri),
      listeTraitement: (state) =>
        state.interventionTraitement.liste.sort((a, b) => a.tri - b.tri),
      listeStat: (state) =>
        state.statIntervention.liste.sort((a, b) => a.tri - b.tri),
      listeType: (state) =>
        state.typeIntervention.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    statistique(id) {
      return id ? this.listeStat.find((s) => s.id === id)?.designation : '';
    },
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
  watch: {},
};
</script>

<style scoped></style>
