<template>
  <div class="wrapper">
    <div class="wrapper">
      <!-- Main Sidebar Container -->
      <main-sidebar class="custom-sidebar" :class="{ 'd-none': hideSidebar }" />
      <div class="content pb-5">
        <app-navbar @toggle-sidebar="hideSidebar = !hideSidebar" />
        <slot class="pb-3" />
      </div>
      <app-modal />
    </div>
  </div>
</template>

<script>
import AppNavbar from '@/components/AppNavbar.vue';
import AppModal from '@/components/AppModal.vue';
import MainSidebar from '@/components/MainSidebar.vue';

export default {
  name: 'DefaultLayout',
  components: {
    MainSidebar,
    AppNavbar,
    AppModal,
  },
  data() {
    return {
      hideSidebar: false,
    };
  },
};
</script>

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
  height: 100vh;
}

.custom-sidebar {
  flex-shrink: 0;
  flex-grow: 0;
  overflow: scroll;
  padding: 0;
  height: 100%;
}
</style>
