<script setup>
import { computed, ref, useTemplateRef } from "vue";
import * as releases from "../../releases.json";
import { DOC_URL } from "../http/Env.js";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth/Auth.js";
import { useTheme } from "../composables/useTheme.js";

const router = useRouter();
const authStore = useAuthStore();
const { theme, toggleTheme } = useTheme();

const { hideSidebar, noSidebar } = defineProps({
  hideSidebar: {
    type: Boolean,
    default: false,
  },
  noSidebar: {
    type: Boolean,
    default: false,
  },
});
defineEmits(["toggleSidebar"]);
const showNotif = ref(
  localStorage.getItem("latestReleaseDate") != releases.releases[0].date ||
    localStorage.getItem("latestSeenVersion") != releases.releases[0].version,
);

const isAdmin = computed(() => authStore.admin);
const dropdownComponent = useTemplateRef("dropdown");

const clickInfo = (navigate) => {
  showNotif.value = false;
  navigate();
};
const parametres = () => {
  dropdownComponent.value.close();
  router.push({ name: "utilisateur" });
};
const logout = () => {
  authStore.logout();
  router.push({ name: "login" });
};
const quitterImpersonation = () => {
  authStore.stopImpersonation().then(() => router.push({ name: "admin-users" }));
};
</script>

<template>
  <div v-if="authStore.impersonating" class="bg-warning text-black text-center py-1 d-print-none">
    Vous êtes connecté en tant que <strong>{{ authStore.user?.name }}</strong> (usurpation)
    <button type="button" class="btn btn-sm btn-dark ms-2" @click="quitterImpersonation">
      Quitter
    </button>
  </div>
  <nav
    class="navbar navbar-expand border-bottom border-left justify-content-between d-print-none"
    :class="theme === 'dark' ? 'bg-dark' : 'bg-body-tertiary'"
  >
    <ul class="navbar-nav">
      <li class="nav-item position-relative me-2 ms-4">
        <button
          v-if="!noSidebar"
          class="btn btn-sm btn-outline-secondary"
          @click="$emit('toggleSidebar')"
        >
          <font-awesome-icon :icon="['fas', 'bars']" />
        </button>
      </li>
      <li v-if="isAdmin" class="nav-item position-relative me-2">
        <router-link v-slot="{ navigate }" :to="{ name: 'admin-sis' }" custom>
          <button class="btn btn-sm btn-link" @click="clickInfo(navigate)">Admin</button>
        </router-link>
      </li>
    </ul>
    <ul class="navbar-nav me-2">
      <li class="position-relative me-2">
        <button
          type="button"
          class="btn btn-sm btn-link nav-link pt-0 pb-0"
          :title="theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'"
          @click="toggleTheme"
        >
          <font-awesome-icon :icon="['fas', theme === 'dark' ? 'sun' : 'moon']" />
        </button>
      </li>
      <li class="position-relative me-2">
        <a
          href="https://github.com/GestSIS"
          target="_blank"
          class="btn btn-sm btn-link nav-link pt-0 pb-0"
        >
          <font-awesome-icon :icon="['brands', 'github']" />
        </a>
      </li>
      <li class="position-relative me-2">
        <a :href="DOC_URL" target="_blank" class="btn btn-sm btn-link nav-link pt-0 pb-0">
          <font-awesome-icon :icon="['far', 'question-circle']" />
        </a>
      </li>
      <router-link v-slot="{ navigate }" :to="{ name: 'about' }" custom>
        <li class="position-relative me-2">
          <button class="btn btn-sm btn-link nav-link pt-0 pb-0" @click="clickInfo(navigate)">
            <font-awesome-icon :icon="['fas', 'bell']" />
            <span
              v-if="showNotif"
              class="position-absolute translate-middle p-1 bg-danger rounded-circle"
            >
              <span class="visually-hidden">nouveautés disponibles</span>
            </span>
          </button>
        </li>
      </router-link>
      <base-dropdown
        ref="dropdown"
        tag="li"
        button-class="btn btn-sm btn-link nav-link pt-0 pb-0"
        menu-class="dropdown-menu-end"
      >
        <template #title>
          <font-awesome-icon :icon="['fas', 'user']" />
        </template>
        <template #default>
          <button class="dropdown-item" @click="parametres">Paramètres</button>
          <div class="dropdown-divider" />
          <button class="dropdown-item" @click="logout">Déconnexion</button>
        </template>
      </base-dropdown>
    </ul>
  </nav>
</template>
