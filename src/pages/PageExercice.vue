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
        <base-navigation-tab
          v-if="!newMode"
          :routes="[
            {
              to: {
                name: 'exercice-details',
                params: { id: activeExerciceId },
              },
              texte: 'Informations',
            },
            {
              to: {
                name: 'exercice-presence',
                params: { id: activeExerciceId },
              },
              texte: 'Presences',
            },
            {
              to: { name: 'exercice-sms', params: { id: activeExerciceId } },
              texte: 'Sms',
            },
          ]"
        />

        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active mb-3" role="tabpanel">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';

export default {
  name: 'PageExercice',
  components: {
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
      loading: true,
    };
  },
  computed: {
    ...mapState({
      activeExerciceData: (state) => state.exercice.active.data,
      activeExerciceId: (state) => state.exercice.active.id,
    }),
    newMode() {
      return this.id === 'new';
    },
    breadcrumbFinal() {
      return this.newMode
        ? 'Nouveau'
        : new Date(this.activeExerciceData.date).toLocaleDateString('fr-CH') +
            ' - ' +
            this.activeExerciceData?.designation;
    },
  },
  watch: {
    activeExerciceId() {
      if (this.newMode) {
        this.$store.dispatch('resetActiveExercice');
      } else {
        const id = parseInt(this.id);

        this.$store.dispatch('selectExercice', id);
        this.$store.dispatch('fetchExercice', id);
        this.$store.dispatch('fetchExerciceSapeurs', id);
        this.$store.dispatch('fetchExerciceSms', id);
      }
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

    const id = parseInt(this.id);

    if (this.newMode) {
      this.$store.dispatch('resetActiveExercice');
    } else {
      this.$store.dispatch('selectExercice', id);
      this.$store.dispatch('fetchExercice', id).then(() => {
        this.loading = false;
      });
      this.$store.dispatch('fetchExerciceSapeurs', id);
    }
  },
};
</script>

<style lang="scss" scoped></style>
