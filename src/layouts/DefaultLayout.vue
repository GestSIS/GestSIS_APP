<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

import AppNavbar from "/src/components/AppNavbar.vue";
import AppModal from "/src/components/AppModal.vue";
import AppSidebar from "/src/components/AppSidebar.vue";
import AppTwoFactorBanner from "/src/components/AppTwoFactorBanner.vue";
import AppTitrePage from "/src/components/AppTitrePage.vue";
import { useRoute } from "vue-router";
import { allerAuContenu } from "/src/tools/titrePage.js";

const route = useRoute();

// Sidebar affichée statiquement à partir du breakpoint Bootstrap "lg" (992px),
// en offcanvas (par-dessus le contenu, avec backdrop) en dessous.
const desktopQuery = window.matchMedia("(min-width: 992px)");
const sidebarOpen = ref(desktopQuery.matches);
const syncSidebarToViewport = (e) => {
  sidebarOpen.value = e.matches;
};
onMounted(() => desktopQuery.addEventListener("change", syncSidebarToViewport));
onUnmounted(() => desktopQuery.removeEventListener("change", syncSidebarToViewport));

// Un clic sur un lien du menu ne referme la sidebar qu'en offcanvas (< lg) ;
// sur desktop elle doit rester ouverte.
const closeSidebarIfMobile = () => {
  if (!desktopQuery.matches) {
    sidebarOpen.value = false;
  }
};

const isMobile = computed(() => {
  const isAndroid = () => navigator.userAgent.match(/Android/i);
  const isIOS = () => navigator.userAgent.match(/iPhone|iPad|iPod/i);
  return isAndroid() || isIOS();
});
</script>

<template>
  <div class="wrapper">
    <div class="wrapper">
      <a
        href="#contenu"
        class="visually-hidden-focusable lien-evitement"
        @click.prevent="allerAuContenu"
      >
        Aller au contenu
      </a>
      <!-- App Sidebar Container -->
      <app-sidebar
        class="custom-sidebar"
        :class="{ show: sidebarOpen }"
        @close="closeSidebarIfMobile"
      />
      <div v-if="sidebarOpen" class="sidebar-backdrop d-lg-none" @click="sidebarOpen = false" />
      <div class="content" :class="isMobile ? 'pb-6' : ''">
        <header>
          <app-navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
          <app-two-factor-banner />
        </header>
        <main
          id="contenu"
          class="contenu-principal"
          :class="{ 'pleine-hauteur': route.meta.pleineHauteur === true }"
        >
          <app-titre-page />
          <slot />
        </main>
      </div>
      <app-modal />
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  width: 100%;
  align-items: stretch;
  height: 100%;
  overflow: hidden;
}

.content {
  flex-grow: 1;
  overflow: scroll;
  display: flex;
  flex-flow: column;
  height: 100%;
}

/* Le <main> prend la place qu'occupait la page directement dans .content (colonne
   flex) : il grandit avec son contenu, et .content reste le conteneur qui défile. */
.contenu-principal {
  display: flex;
  flex-flow: column;
  flex: 1 0 auto;
}

/* Pages à colonnes défilant indépendamment (meta `pleineHauteur`) : le <main> est
   limité à la hauteur restante pour que la page puisse s'y ajuster. */
.contenu-principal.pleine-hauteur {
  flex: 1 1 0;
  min-height: 0;
}

.custom-sidebar {
  flex-shrink: 0;
  flex-grow: 0;
  overflow: scroll;
  padding: 0;
  height: 100%;
}

.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}
</style>
