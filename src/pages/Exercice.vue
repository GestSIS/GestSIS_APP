<template>
  <div>
    <div class="container-fluid">
      <ol class="breadcrumb bg-white">
        <li class="breadcrumb-item">
          <router-link tag="a" to="/">
            Accueil
          </router-link>
        </li>
        <li class="breadcrumb-item">
          <router-link tag="a" to="/exercices">
            Exercices
          </router-link>
        </li>
        <li class="breadcrumb-item active" aria-current="page">
          {{ getExercice(parseInt(id)).communication }}
        </li>
      </ol>
      <div class="row">
        <div class="col-md-12">
          <nav class="">
            <div class="nav nav-tabs" id="nav-tab" role="tablist">
              <a
                class="nav-item nav-link"
                :class="{ active: !tabPresence }"
                role="tab"
                href="#"
                @click.prevent="tabPresence = false"
                >Informations</a
              >
              <a
                class="nav-item nav-link"
                :class="{ active: tabPresence }"
                role="tab"
                href="#"
                @click.prevent="tabPresence = true"
                >Présences</a
              >
            </div>
          </nav>
          <div class="tab-content" id="nav-tabContent">
            <div class="tab-pane fade show active" role="tabpanel">
              <ExerciceTabSapeurs v-if="tabPresence"></ExerciceTabSapeurs>
              <ExerciceTabGeneral v-if="!tabPresence"></ExerciceTabGeneral>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import ExerciceTabSapeurs from '@/components/ExerciceTabSapeurs.vue'
import ExerciceTabGeneral from '@/components/ExerciceTabGeneral.vue'

export default {
  name: 'exercice',
  components: {
    ExerciceTabSapeurs,
    ExerciceTabGeneral
  },
  data() {
    return {
      tabPresence: true
    }
  },
  props: {
    id: {
      type: String
    }
  },
  computed: {
    ...mapGetters(['getExercice'])
  },
  mounted() {
    let id = parseInt(this.id)

    this.$store.dispatch('fetchListSapeur')
    this.$store.dispatch('fetchLocalites')
    this.$store.dispatch('fetchExerciceCategories')
    this.$store.dispatch('fetchExcuseTypes')

    this.$store.dispatch('selectExercice', id)
    this.$store.dispatch('fetchExercice', id)
    this.$store.dispatch('fetchExerciceSapeurs', id)
  },
  watch: {
    activeExerciceId() {
      let id = parseInt(this.id)

      this.$store.dispatch('selectExercice', id)
      this.$store.dispatch('fetchExercice', id)
      this.$store.dispatch('fetchExerciceSapeurs', id)
    }
  }
}
</script>

<style lang="scss" scoped></style>
