<template>
  <div class="wrapper">
    <div class="wrapper">
      <!-- Main Sidebar Container -->
      <main-sidebar class="sidebar" />

      <div class="content">
        <navbar />
        <slot />
      </div>
      <app-modal />
    </div>
    <footer />
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
import Navbar from '@/components/Navbar'
import AppModal from '@/components/AppModal'
import MainSidebar from '@/components/MainSidebar'

export default {
  components: {
    Navbar,
    MainSidebar,
    AppModal
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  width: 100%;
  align-items: stretch;
  height: 100%;
  overflow: hidden;
}

.content {
  flex-grow: 1;  /*ensures that the container will take up the full height of the parent container*/
  overflow-y: auto;  /*adds scroll to this container*/
}

.sidebar {
  flex-shrink: 0;
  flex-grow: 0;
  padding: 0;
}
</style>
