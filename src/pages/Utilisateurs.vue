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
            <button
              @click="invite"
              class="btn btn-outline-primary"
            >
              Inviter
            </button>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in users" :key="u.id">
                <td>{{ u.name }}</td>
                <td>{{ formatSapeur(u.email) }}</td>
                <td>{{ u.email }}</td>
                <td><span v-for="r in u.user_roles" :key="r.id" class="badge badge-primary mr-1">{{ formatRole(r.role_id) }}</span></td>
                <!-- <td>{{ u }}</td> -->
                <td>
                  <div class="d-flex">
                    <button
                      class="btn btn-outline-primary border-0"
                      @click="edit(u)"
                    >
                      <font-awesome-icon :icon="['far', 'edit']" />
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
import { mapGetters, mapState, mapMutations } from 'vuex';
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
    ...mapMutations(['SHOW_MODAL']),
    formatRole(id) {
      console.log("Format role "+id)
      return (this.roles.find((r) => r.id === id) || {nom:''}).nom
    },
    formatSapeur(email) {
      const sapeur = this.sapeurs.find((s) => s.email === email);
      return sapeur ? sapeur.nom + " " + sapeur.prenom : '-';
    },
    invite() {
      //TODO: Show modal
      this.SHOW_MODAL({ component: 'ModalRegisterToken' });
    },
    edit(user) {
      this.SHOW_MODAL({ component: 'ModalUserRole', data: { ...user, roles: user.user_roles.map(r => r.role_id) } });
    }
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
