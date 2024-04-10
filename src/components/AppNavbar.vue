<template>
  <nav
    class="navbar navbar-expand bg-light navbar-light border-bottom border-left justify-content-between"
  >
    <ul class="navbar-nav">
      <li class="nav-item position-relative me-2 ms-4">
        <button
          v-if="!noSidebar"
          class="btn btn-outline-secondary"
          @click="$emit('toggleSidebar')"
        >
          <font-awesome-icon :icon="['fas', 'bars']" />
        </button>
      </li>
      <li class="nav-item position-relative me-2">
        <a :href="docUrl" target="_blank" class="btn btn-link">Documentation</a>
      </li>
      <li v-if="isAdmin" class="nav-item position-relative me-2">
        <router-link v-slot="{ navigate }" :to="{ name: 'admin-sis' }" custom>
          <button class="btn btn-link" @click="clickInfo(navigate)">
            Admin
          </button>
        </router-link>
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
import { mapGetters, mapState } from 'vuex';
import * as data from '../../releases.json';

const DOC_URL = import.meta.env.VITE_DOC_ENDPOINT;

export default {
  name: 'AppNavbar',
  props: {
    hideSidebar: {
      type: Boolean,
      default: false,
    },
    noSidebar: {
      type: Boolean,
      default: () => false,
    },
  },
  emits: ['toggleSidebar'],
  data: () => {
    return {
      releases: data.releases,
      showNotif: false,
      docUrl: DOC_URL,
    };
  },
  computed: {
    ...mapGetters(['isLoggedIn']),
    ...mapState({
      isAdmin: (state) => state.auth.admin,
    }),
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
