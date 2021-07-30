<template>
  <nav
    class="navbar navbar-expand bg-light navbar-light border-bottom border-left"
  >
    <!-- Left navbar links -->
    <ul class="navbar-nav">
      <li class="nav-item">
        <a class="nav-link" data-widget="pushmenu" href="#">
          <i class="fa fa-bars"></i>
        </a>
      </li>
      <li class="nav-item d-none d-sm-inline-block">
        <router-link :to="{name:'accueil'}" class="nav-link">
          Accueil
        </router-link>
      </li>
      <button
        class="btn btn-primary d-lg-inline-block mb-3 mb-md-0 ml-md-3"
        @click="logout"
      >
        Logout
      </button>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Navbar',
  methods: {
    logout() {
      this.$store.dispatch('logout').then(() => {
        this.$router.push('/');
      });
    }
  }
};
</script>
