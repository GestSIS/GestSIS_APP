<template>
  <nav class="navbar navbar-expand bg-light navbar-light border-bottom border-left justify-content-between">
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" data-widget="pushmenu" href="#">
          <i class="fa fa-bars"></i>
        </a>
      </li>
    </ul>
    <ul class="navbar-nav me-2">
      <router-link :to="{ name: 'about' }" class="nav-link" custom v-slot="{ navigate }">
        <li class="position-relative me-2">
          <button :href="href" class="btn btn-link nav-link" @click="clickInfo(navigate)">
            <font-awesome-icon :icon="['fas', 'bell']" />
            <span class="position-absolute translate-middle p-1 bg-danger rounded-circle" v-if="showNotif">
              <span class="visually-hidden">Notifications</span>
            </span>
          </button>
        </li>
      </router-link>
      <base-dropdown tag="li" buttonClass="btn btn-link nav-link" menuClass="dropdown-menu-end" ref="dropdown">
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
import * as data from '../../releases.json';

export default {
  name: 'Navbar',
  data: () => {
    return {
      releases: data.releases,
      showNotif: false
    };
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
        this.$router.push('/');
      });
    },
  },
};
</script>
