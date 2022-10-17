<template>
  <div class="wrapper">
    <div class="wrapper">
      <!-- Main Sidebar Container -->
      <main-sidebar class="custom-sidebar" :class="{ 'd-none': hideSidebar }" />
      <div class="content">
        <app-navbar @toggle-sidebar="hideSidebar = !hideSidebar" />
        <slot />
      </div>
      <app-modal />
    </div>
  </div>

  <!-- Control Sidebar -->
  <!-- @include('control-sidebar') -->
  <!-- /.control-sidebar -->
  <!-- @else
          <div id="main-content">
            <div class="container-fluid">
              @include('common')
              @yield('content')
            </div>
          </div>
  @endif-->
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
  overflow: hidden;
  /*adds scroll to this container*/
  display: flex;
  flex-flow: column;
  height: 100vh;
}

.custom-sidebar {
  flex-shrink: 0;
  flex-grow: 0;
  padding: 0;
}

.container-fluid {
  overflow-y: scroll;
}
</style>
