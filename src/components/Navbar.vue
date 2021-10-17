<template>
  <nav
    class="
      navbar navbar-expand
      bg-light
      navbar-light
      border-bottom border-left
      justify-content-between
    "
  >
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" data-widget="pushmenu" href="#">
          <i class="fa fa-bars"></i>
        </a>
      </li>
      <!-- <li class="nav-item d-none d-sm-inline-block mr-auto">
        <router-link :to="{ name: 'accueil' }" class="nav-link">
          Accueil
        </router-link>
      </li> -->
    </ul>
    <ul class="navbar-nav">
      <base-dropdown
        tag="li"
        buttonClass="btn btn-link"
        menuClass="dropdown-menu-right"
        ref="dropdown"
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
export default {
  name: 'Navbar',
  methods: {
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
