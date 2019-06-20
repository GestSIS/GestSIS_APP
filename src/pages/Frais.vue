<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">
                Accueil
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Frais
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav>
          <div class="nav nav-tabs mb-3" id="nav-tab" role="tablist">
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'comptes' }"
              role="tab"
              @click.prevent="activeTab = 'comptes'"
            >
              Comptes
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'exercices' }"
              role="tab"
              @click.prevent="activeTab = 'exercices'"
            >
              Exercices
            </button>
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'interventions' }"
              role="tab"
              @click.prevent="activeTab = 'interventions'"
            >
              Interventions
            </button>
          </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" role="tabpanel">
            <!--            <ExerciceTabSapeurs-->
            <!--              v-if="activeTab === 'comptes'"-->
            <!--            ></ExerciceTabSapeurs>-->
            <!--            <ExerciceTabSapeurs-->
            <!--              v-if="activeTab === 'exercices'"-->
            <!--            ></ExerciceTabSapeurs>-->
            <!--            <ExerciceTabSapeurs-->
            <!--              v-if="activeTab === 'interventions'"-->
            <!--            ></ExerciceTabSapeurs>-->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'

import ExerciceComptable from '@/components/ExerciceComptable'

export default {
  name: 'exercice',
  components: {
    ExerciceComptable
  },
  data() {
    return {
      activeTab: 'comptes',
      loading: true
    }
  },
  computed: {
    // ...mapGetters(['activeExerciceData']),
  },
  mounted() {
    // this.$store.dispatch('fetchListSapeur')
    // this.$store.dispatch('fetchLocalites')
    // this.$store.dispatch('fetchExerciceCategories')
    // this.$store.dispatch('fetchExercicesComptables')
    // this.$store.dispatch('fetchExcuseTypes')
  }
}
</script>

<style lang="scss" scoped></style>
