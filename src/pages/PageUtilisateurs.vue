<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Utilisateurs
            </li>
          </ol>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
          <button
            class="nav-item nav-link"
            role="tab"
            :class="{ active: tab == 'users' }"
            @click="tab = 'users'"
          >
            Utilisateurs
          </button>
          <button
            class="nav-item nav-link"
            role="tab"
            :class="{ active: tab == 'sapeurs' }"
            @click="tab = 'sapeurs'"
          >
            Sapeurs sans comptes
          </button>
        </nav>
      </div>
      <liste-utilisateur v-if="tab == 'users'" />
      <sapeur-sans-compte v-if="tab == 'sapeurs'" />
    </div>
  </div>
</template>

<script>
import ListeUtilisateur from '../components/utilisateur/ListeUtilisateur.vue';
import SapeurSansCompte from '../components/utilisateur/SapeurSansCompte.vue';
import store from '/src/store/index';

function loadData(routeTo, next) {
  let loadUsers = store.dispatch('fetchUsers');
  let loadPermissions = store.dispatch('fetchPermissions');
  let loadRoles = store.dispatch('fetchRoles');
  let loadSapeurs = store.dispatch('fetchListeSapeur');

  Promise.all([loadUsers, loadPermissions, loadRoles, loadSapeurs]).then(() => {
    next();
  });
}

export default {
  name: 'PageUtilisateurs',
  components: {
    ListeUtilisateur,
    SapeurSansCompte,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      tab: 'users',
    };
  },
};
</script>

<style></style>
