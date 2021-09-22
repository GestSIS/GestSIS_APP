<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb bg-white">
          <li class="breadcrumb-item">
            <router-link tag="a" :to="{ name: 'accueil' }">Accueil</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Mutations RTA
          </li>
        </ol>
      </div>
      <div class="col-md-4 d-flex justify-content-end"></div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav class="nav nav-tabs mb-3" id="nav-tab" role="tablist">
          <router-link
            :to="{ name: 'rta-mutations' }"
            class="nav-item nav-link"
            exact-active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Mutations</span>
          </router-link>
          <router-link
            :to="{ name: 'rta-gestsis' }"
            class="nav-item nav-link"
            active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>GestSIS</span>
          </router-link>
          <router-link
            :to="{ name: 'rta-reference' }"
            class="nav-item nav-link"
            active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Référence</span>
          </router-link>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" role="tabpanel">
            <router-view></router-view>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'rta',
};
</script>

<style lang="scss" scoped></style>
