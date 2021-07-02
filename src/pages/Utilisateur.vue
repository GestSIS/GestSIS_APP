<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Utilisateurs
            </li>
          </ol>
        </nav>
      </div>
      <!-- <div class="col-md-6 d-flex justify-content-end">
        <exercice-comptable />
      </div> -->
    </div>
    <div class="row">
      <div class="col-md-12">
        <!-- /.card-header -->
        <div class="card card-primary card-outline mb-5">
          <div class="card-header d-flex justify-content-between">
            <h3>Liste des utilisateurs</h3>
            <router-link
              tag="button"
              :to="{name: 'utilisateur'}"
              class="btn btn-outline-primary"
            >
              Inviter
            </router-link>
          </div>
          <div class="card-body d-flex justify-content-center" v-if="loading">
            <div class="spinner-border" role="status">
              <span class="sr-only">Chargement...</span>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <!-- <th>Dernière connexion</th> -->
                <th>Sapeur</th>
                <th>Email</th>
                <th>Rôles</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.name }}</td>
                <td>{{ formatSapeur(u.email) }}</td>
                <td>{{ u.email }}</td>
                <td><span v-for="r in u.user_roles" :key="r.id" class="badge badge-primary">{{ formatRole(r.role_id) }}</span></td>
                <!-- <td>{{ u }}</td> -->
              </tr>
            </tbody>
            <div
              slot="accepter"
              slot-scope="props"
              class="custom-control custom-checkbox"
            >
              <input
                type="checkbox"
                class="custom-control-input"
                id="accepter"
                :checked="props.rowData.accepter"
                disabled
              />
              <label class="custom-control-label" for="accepter"></label>
            </div>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import store from '@/store/index';

// import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';
// import ControlesMedicauxService from '@/services/ControlesMedicauxService';

// import VuetableRowHeader from 'vuetable-2/src/components/VuetableRowHeader.vue'
import _ from 'lodash';

function loadData(routeTo, next) {
  let loadUsers = store.dispatch('fetchUsers');
  let loadPermissions = store.dispatch('fetchPermissions');
  let loadRoles = store.dispatch('fetchRoles');
  let loadSapeurs = store.dispatch('fetchListeSapeur');

  Promise.all([
    loadUsers,
    loadPermissions,
    loadRoles,
    loadSapeurs
  ]).then(() => {
    next();
  });
}

export default {
  name: 'utilisateurs',
  components: {
    // ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  mounted() {
    this.loading = false;
  },
  data() {
    return {
      toggles: {},
      loading: true,
    };
  },
  computed: {
    ...mapState({
      users: (state) => state.auth.users,
      roles: (state) => state.auth.roles,
      permissions: (state) => state.auth.permissions,
      sapeurs: (state) => state.sapeur.liste,
    }),
    // ...mapGetters(['getSapeur', 'getMedecin', 'getControleMedicalType']),
    // computedData() {
    //   const now = Date.now();
    //   return this.listeControlesMedicaux.map((s) => {
    //     const sapeur = this.getSapeur(s.sapeur_id);
    //     var age = Math.floor(
    //       (now - new Date(sapeur.date_naissance).getTime()) /
    //         1000 /
    //         (60 * 60 * 24) /
    //         365.25
    //     );
    //     return {
    //       ...s,
    //       sapeur: `${sapeur.nom} ${sapeur.prenom}`,
    //       age,
    //       type: this.getControleMedicalType(s.controle_medical_type_id)
    //         .designation,
    //       medecin: this.getMedecin(s.medecin_id).designation,
    //     };
    //   });
    // },
  },
  methods: {
    formatRole(id) {
      return (this.roles.find((r) => r.id === id) || {nom:''}).nom
    },
    formatSapeur(email) {
      const sapeur = this.sapeurs.find((s) => s.email === email);
      return sapeur ? sapeur.nom + " " + sapeur.prenom : '-';
    },
    // downloadJustificatif({ id, filename }) {
    //   ControlesMedicauxService.downloadJustificatif(id, filename);
    // },
    // dataManager(sortOrder) {
    //   if (this.computedData.length < 1) return;

    //   let local = this.computedData;

    //   // sortOrder can be empty, so we have to check for that as well
    //   if (sortOrder.length > 0) {
    //     local = _.orderBy(
    //       local,
    //       sortOrder[0].sortField,
    //       sortOrder[0].direction
    //     );
    //   }

    //   return {
    //     data: local,
    //   };
    // },
    // onRowClass(dataItem) {
    //   // TODO: update pour mettre en évidence les contrôles-médicaux voulus
    //   const statutsClass = {
    //     0: 'text-danger', //'Annulé',
    //     1: '', //'A saisir',
    //     2: '', //'En attente de validation',
    //     3: '', //'A imputer',
    //     4: 'table-success', //'Imputée'
    //   };
    //   return statutsClass[dataItem.statut];
    // },
  },
};
</script>

<style>
table button.btn {
  padding-top: 0;
  padding-bottom: 0;
}
.m-td-0 > td {
  padding: 0 !important;
}
</style>
