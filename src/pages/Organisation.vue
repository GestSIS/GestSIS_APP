<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <ol class="breadcrumb bg-white">
          <li class="breadcrumb-item">
            <router-link tag="a" to="/">
              Accueil
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Organisation
          </li>
        </ol>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <!--        <exercice-comptable />-->
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <span></span>
            <button class="btn btn-outline-primary">
              Save
            </button>
          </div>
          <div class="card-body">
            <tree/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

// import InterventionTabGeneral from '@/components/InterventionTabGeneral.vue'
// import InterventionTabSapeurs from '@/components/InterventionTabSapeurs.vue'
// import InterventionTabMateriel from '@/components/InterventionTabMateriel.vue'
// import InterventionTabVehicule from '@/components/InterventionTabVehicule.vue'
// import InterventionTabJournal from '@/components/InterventionTabJournal.vue'
import Tree from '@/components/tree/Tree.vue'

export default {
  name: 'groups',
  components: {
    Tree
  }
};
</script>

<style lang="scss" scoped></style>
