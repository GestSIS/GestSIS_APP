<script setup>
import { computed } from "vue";
import SisSelection from "/src/components/sis/SisSelection.vue";
import links from "/src/router/menu.js";
import { useAuthStore } from "../stores/auth/Auth.js";

const authStore = useAuthStore();

const isAdmin = computed(() => authStore.admin);
const isSapeur = computed(() => authStore.sapeurId);
const perms = computed(() => authStore.sis.permissions);

const filteredLinks = computed(() =>
  links.filter(
    (l) =>
      (!l.permission && !l.permissions && !l.sapeur) ||
      perms.value?.includes(l.permission) ||
      perms.value?.filter((p) => new Set(l.permissions).has(p)).length ||
      (isAdmin.value && !l.sapeur) ||
      (l.sapeur && isSapeur.value),
  ),
);

defineEmits(["close"]);
</script>

<template>
  <aside id="sidebar" class="bg-dark text-white p-3">
    <router-link
      :to="{ name: 'accueil' }"
      class="sidebar-header ps-3 pe-3 d-block text-white text-decoration-none"
    >
      <img alt="logo" src="../assets/logo.svg" class="logo text-center" />
      <h2 class="brand-text m-0 text-center">GestSIS</h2>
    </router-link>
    <sis-selection />
    <hr />

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
            :class="{
              active: (link?.active ?? (() => false))($route),
            }"
            @click="$emit('close')"
          >
            <font-awesome-icon :icon="link.icon" class="sidebar-icon" />
            <span class="ms-3">{{ link.nom }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar-icon {
  width: 20px;
}

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

/* Mobile/tablette : sidebar en offcanvas par-dessus le contenu */
@media (max-width: 991.98px) {
  aside#sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    width: 260px;
    max-width: 85vw;
    z-index: 1045;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
  }

  aside#sidebar.show {
    transform: translateX(0);
  }
}

/* Desktop : le bouton "hamburger" replie/déplie la sidebar dans le flux */
@media (min-width: 992px) {
  aside#sidebar:not(.show) {
    display: none;
  }
}
</style>
