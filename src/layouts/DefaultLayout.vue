<script setup>
import { computed, ref } from 'vue';

import AppNavbar from '/src/components/AppNavbar.vue';
import AppModal from '/src/components/AppModal.vue';
import AppSidebar from '/src/components/AppSidebar.vue';

const hideSidebar = ref(false);

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
      <app-sidebar class="custom-sidebar" :class="{ 'd-none': hideSidebar }" />
      <div class="content" :class="isMobile ? 'pb-6' : ''">
        <!-- <div class="position-absolute top-0">
          <button
            v-if="!noSidebar"
            class="btn btn-outline-secondary"
            @click="hideSidebar = !hideSidebar"
          >
            <font-awesome-icon :icon="['fas', 'bars']" />
          </button>
        </div> -->
        <app-navbar @toggle-sidebar="hideSidebar = !hideSidebar" />
        <slot />
      </div>
      <app-modal />
    </div>
  </div>
</template>

<style lang="scss">
.wrapper {
  display: flex;
  width: 100%;
  align-items: stretch;
  height: 100%;
  overflow: hidden;
}

.content {
  flex-grow: 1;
  /*ensures that the container will take up the full height of the parent container*/
  // overflow-y: auto; /*adds scroll to this container*/
  overflow: scroll;
  /*adds scroll to this container*/
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
</style>
