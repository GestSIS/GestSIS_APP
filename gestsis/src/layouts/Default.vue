<template>
  <div>
    <!-- Navbar -->
    <navbar />
    <!-- /.navbar -->

    <!-- Main Sidebar Container -->

    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper" id="main-content">
      <div class="container-fluid">
        <main-sidebar />
        <slot />
      </div>
    </div>
    <!-- /.content-wrapper -->

    <!-- Control Sidebar -->
    <!-- @include('control-sidebar') -->
    <!-- /.control-sidebar -->

    <!-- Main Footer -->
    <footer />
  </div>
  <!-- ./wrapper -->
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
// import Footer from '@/components/Footer'
import MainSidebar from '@/components/MainSidebar'

export default {
  components: {
    Navbar,
    //Footer,
    MainSidebar
  }
}
</script>
