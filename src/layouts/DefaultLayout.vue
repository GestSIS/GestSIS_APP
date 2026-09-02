<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";

import AppNavbar from "/src/components/AppNavbar.vue";
import AppModal from "/src/components/AppModal.vue";
import AppSidebar from "/src/components/AppSidebar.vue";

// Sidebar affichée statiquement à partir du breakpoint Bootstrap "lg" (992px),
// en offcanvas (par-dessus le contenu, avec backdrop) en dessous.
const desktopQuery = window.matchMedia("(min-width: 992px)");
const sidebarOpen = ref(desktopQuery.matches);
const syncSidebarToViewport = (e) => {
  sidebarOpen.value = e.matches;
};
onMounted(() => desktopQuery.addEventListener("change", syncSidebarToViewport));
onUnmounted(() => desktopQuery.removeEventListener("change", syncSidebarToViewport));

const isMobile = computed(() => {
  const isAndroid = () => navigator.userAgent.match(/Android/i);
  const isIOS = () => navigator.userAgent.match(/iPhone|iPad|iPod/i);
  return isAndroid() || isIOS();
});
</script>

<template>
  <div class="wrapper">
    <div class="wrapper">
      <!-- App Sidebar Container -->
      <app-sidebar
        class="custom-sidebar"
        :class="{ show: sidebarOpen }"
        @close="sidebarOpen = false"
      />
      <div v-if="sidebarOpen" class="sidebar-backdrop d-lg-none" @click="sidebarOpen = false" />
      <div class="content" :class="isMobile ? 'pb-6' : ''">
        <app-navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
        <slot />
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
