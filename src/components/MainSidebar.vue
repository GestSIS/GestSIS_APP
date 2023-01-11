<template>
  <aside id="sidebar" class="bg-dark text-white p-3">
    <div class="sidebar-header ps-3 pe-3">
      <img alt="logo" src="../assets/logo.svg" class="logo text-center" />
      <h2 class="brand-text m-0 text-center">GestSIS</h2>
    </div>
    <sis-selection />
    <!--    <hr class="bg-secondary" />-->
    <!--    &lt;!&ndash; Sidebar user panel (optional) &ndash;&gt;-->
    <!--    <div class="sidebar-user">-->
    <!--      <div class="image">-->
    <!--        &lt;!&ndash; @if($user_details['photo'])-->
    <!--        <img-->
    <!--          src="{{ $user_details['photo'] }}"-->
    <!--          class="img-circle elevation-2"-->
    <!--        >-->
    <!--        @endif&ndash;&gt;-->
    <!--        Image-->
    <!--      </div>-->
    <!--      <div class="info">-->
    <!--        <a href="#" class="d-block">-->
    <!--          &lt;!&ndash; @if(!empty($user_details['nom']))-->
    <!--          {{ $user_details['prenom'] }} {{ $user_details['nom'] }}-->
    <!--          @else-->
    <!--          {{ $user_details['nom_utilisateur'] }}-->
    <!--          @endif&ndash;&gt;-->
    <!--          John Doe-->
    <!--        </a>-->
    <!--      </div>-->
    <!--    </div>-->
    <hr />

    <!-- Sidebar Menu -->
    <nav class="menu-options mt-2">
      <ul
        class="nav nav-pills nav-sidebar flex-column"
        data-widget="treeview"
        role="menu"
        data-accordion="false"
      >
        <li v-for="link in filteredLinks" :key="link.nom" class="nav-item">
          <router-link
            :to="link.to"
            class="nav-link text-white"
            active-class="active"
          >
            <font-awesome-icon :icon="link.icon" />
            <span class="ms-3">{{ link.nom }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
  <!-- /.sidebar -->
</template>

<script>
import SisSelection from '/src/components/sis/SisSelection.vue';
import links from '/src/router/menu.js';

import { mapState } from 'vuex';

export default {
  name: 'MainSidebar',
  components: {
    SisSelection,
  },
  data() {
    return {
      links,
    };
  },
  computed: {
    ...mapState({
      isAdmin: (state) => state.auth.admin,
      isSapeur: (state) => state.auth.sapeurId,
      perms: (state) => state.auth.sis.permissions,
    }),
    filteredLinks() {
      return this.links.filter(
        (l) =>
          (!l.permission && !l.permissions && !l.admin && !l.sapeur) ||
          this.perms?.includes(l.permission) ||
          this.perms?.filter((p) => new Set(l.permissions).has(p)).length ||
          (this.isAdmin && !l.sapeur) ||
          (l.sapeur && this.isSapeur)
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.logo {
  max-width: 80px;
  display: block;
  margin: 0px auto -15px auto;
}

aside {
  overflow: scroll;
}

ul li a:hover {
  color: var(--bs-primary) !important;
  background: #fff;
}

ul li a.active:hover {
  color: white !important;
}
</style>
