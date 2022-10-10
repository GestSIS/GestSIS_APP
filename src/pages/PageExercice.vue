<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'exercices' }">Exercices</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              {{ breadcrumbFinal }}
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <nav
          v-if="!newMode"
          id="nav-tab"
          class="nav nav-tabs mb-3"
          role="tablist"
        >
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
        </nav>
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel">
            <ExerciceTabSapeurs v-if="tabPresence"></ExerciceTabSapeurs>
            <ExerciceTabGeneral
              v-if="!tabPresence"
              :new-mode="newMode"
            ></ExerciceTabGeneral>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

import ExerciceTabSapeurs from '@/components/exercice/ExerciceTabSapeurs.vue';
import ExerciceTabGeneral from '@/components/exercice/ExerciceTabGeneral.vue';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';

export default {
  name: 'PageExercice',
  components: {
    ExerciceTabSapeurs,
    ExerciceTabGeneral,
    ExerciceComptable,
  },
  props: {
    id: {
      type: String,
      default: 'new',
    },
  },
  data() {
    return {
      tabPresence: true,
      loading: true,
    };
  },
  computed: {
    ...mapGetters(['activeExerciceData']),
    newMode() {
      return this.id === 'new';
    },
    breadcrumbFinal() {
      return this.newMode ? 'Nouveau' : this.activeExerciceData.designation;
    },
  },
  watch: {
    activeExerciceId() {
      let id = parseInt(this.id);

      this.$store.dispatch('selectExercice', id);
      this.$store.dispatch('fetchExercice', id);
      this.$store.dispatch('fetchExerciceSapeurs', id);
    },
  },
  mounted() {
    this.$store.dispatch('fetchListeSapeur');
    this.$store.dispatch('fetchLocalites');
    this.$store.dispatch('fetchExerciceCategories');
    this.$store.dispatch('fetchExercicesComptables');
    this.$store.dispatch('fetchExcuseTypes');
    this.$store.dispatch('fetchHeuresExercice');
    this.$store.dispatch('fetchUnites');

    let id = parseInt(this.id);

    if (this.newMode) {
      this.$store.dispatch('resetActiveExercice');
    } else {
      this.$store.dispatch('selectExercice', id);
      this.$store.dispatch('fetchExercice', id).then(() => {
        this.loading = false;
      });
      this.$store.dispatch('fetchExerciceSapeurs', id);
    }
    this.tabPresence = !this.newMode;
  },
};
</script>

<style lang="scss" scoped></style>
