<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb bg-white">
          <li class="breadcrumb-item">
            <router-link tag="a" to="/">Accueil</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Configuration
          </li>
        </ol>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <!--        <exercice-comptable />-->
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav class="nav nav-tabs mb-3" id="nav-tab" role="tablist">
          <router-link
            :to="{ name: 'param-general' }"
            class="nav-item nav-link"
            exact-active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Général</span>
          </router-link>
          <router-link
            :to="{ name: 'param-exercice-comptable' }"
            class="nav-item nav-link"
            active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Exercice Comptables</span>
          </router-link>
          <router-link
            :to="{ name: 'param-sapeur' }"
            class="nav-item nav-link"
            active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Sapeur</span>
          </router-link>
          <router-link
            :to="{ name: 'param-exercice' }"
            class="nav-item nav-link"
            active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Exercice</span>
          </router-link>
          <router-link
            :to="{ name: 'param-intervention' }"
            class="nav-item nav-link"
            active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Intervention</span>
          </router-link>
          <router-link
            :to="{ name: 'param-frais' }"
            class="nav-item nav-link"
            active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Comptabilité</span>
          </router-link>
          <router-link
            :to="{ name: 'param-controle-medical' }"
            class="nav-item nav-link"
            active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Contrôles médicaux</span>
          </router-link>
          <router-link
            :to="{ name: 'param-droits' }"
            class="nav-item nav-link"
            active-class="active"
            role="tab"
            tag="a"
          >
            <!-- <font-awesome-icon icon="fire-extinguisher" /> -->
            <span>Droits et rôles</span>
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
// import { mapGetters } from 'vuex'

// import InterventionTabGeneral from '@/components/InterventionTabGeneral.vue'

export default {
  name: 'configuration',
  data() {
    return {
      activeTab: 'general',
    };
  },
  // props: {
  //   id: {
  //     type: String
  //   }
  // },
  computed: {
    // ...mapGetters(['activeInterventionData', 'activeInterventionId']),
  },
  mounted() {
    // this.$store.dispatch('fetchListeSapeur')
    // this.$store.dispatch('fetchLocalites')
    // this.$store.dispatch('fetchInterventionTraitements')
    // this.$store.dispatch('fetchExercicesComptables')
    // this.$store.dispatch('fetchTypeInterventions')
    // this.$store.dispatch('fetchStatFederals')
    // let id = parseInt(this.id)
    // let svm = this
    // if (this.newMode) {
    //   this.$store
    //     .dispatch('resetActiveIntervention')
    //     .then(() => (svm.loading = false))
    // } else {
    //   this.$store.dispatch('selectIntervention', id)
    //   this.$store
    //     .dispatch('fetchIntervention', id)
    //     .then(() => (svm.loading = false))
    // }
  },
};
</script>

<style lang="scss" scoped></style>
