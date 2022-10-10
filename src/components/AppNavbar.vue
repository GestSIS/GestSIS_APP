<template>
  <nav
    class="navbar navbar-expand bg-light navbar-light border-bottom border-left justify-content-between"
  >
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" data-widget="pushmenu" href="#">
          <i class="fa fa-bars"></i>
        </a>
      </li>
    </ul>
    <ul class="navbar-nav me-2">
      <router-link v-slot="{ navigate }" :to="{ name: 'about' }" custom>
        <li class="position-relative me-2">
          <button class="btn btn-link nav-link" @click="clickInfo(navigate)">
            <font-awesome-icon :icon="['fas', 'bell']" />
            <span
              v-if="showNotif"
              class="position-absolute translate-middle p-1 bg-danger rounded-circle"
            >
              <span class="visually-hidden">Notifications</span>
            </span>
          </button>
        </li>
      </router-link>
      <base-dropdown
        ref="dropdown"
        tag="li"
        button-class="btn btn-link nav-link"
        menu-class="dropdown-menu-end"
      >
        <template #title>
          <font-awesome-icon :icon="['fas', 'user']" />
        </template>
        <template #default>
          <button class="dropdown-item" @click="parametres">Paramètres</button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click="logout">Déconnexion</button>
        </template>
      </base-dropdown>
    </ul>
  </nav>
</template>

<script>
import { mapGetters } from 'vuex';
import * as data from '../../releases.json';

export default {
  name: 'AppNavbar',
  data: () => {
    return {
      releases: data.releases,
      showNotif: false,
    };
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
  },
  mounted() {
    this.showNotif =
      localStorage.getItem('latestReleaseDate') != this.releases[0].date ||
      localStorage.getItem('latestSeenVersion') != this.releases[0].version;
  },
  methods: {
    clickInfo(navigate) {
      this.showNotif = false;
      navigate();
    },
    parametres() {
      this.$refs.dropdown.close();
      this.$router.push({ name: 'utilisateur' });
    },
    logout() {
      this.$store.dispatch('logout').then(() => {
        this.$router.push({ name: 'login' });
      });
    },
  },
};
</script>
