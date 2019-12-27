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
            <button
              class="btn btn-link nav-item nav-link"
              :class="{ active: activeTab === 'annuel' }"
              role="tab"
              @click.prevent="activeTab = 'annuel'"
            >
              Indemnités et Frais annuels
            </button>
          </div>
        </nav>
        <div class="tab-content" id="nav-tabContent">
          <div class="tab-pane fade show active" role="tabpanel">
            <FraisTabComptes v-if="activeTab === 'comptes'"></FraisTabComptes>
            <FraisTabExercice v-if="activeTab === 'exercices'">
            </FraisTabExercice>
            <FraisTabIntervention v-if="activeTab === 'interventions'">
            </FraisTabIntervention>
            <FraisTabAnnuel v-if="activeTab === 'annuel'"></FraisTabAnnuel>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '@/components/ExerciceComptable';
import FraisTabExercice from '@/components/FraisTabExercice';
import FraisTabComptes from '@/components/FraisTabComptes';
import FraisTabIntervention from '@/components/FraisTabIntervention';
import FraisTabAnnuel from '@/components/FraisTabAnnuel';

export default {
  name: 'frais',
  components: {
    ExerciceComptable,
    FraisTabComptes,
    FraisTabExercice,
    FraisTabIntervention,
    FraisTabAnnuel
  },
  data() {
    return {
      activeTab: 'comptes',
      loading: true
    };
  },
  mounted() {
    //TODO Load only if neccessary
    this.$store.dispatch('fetchIndemnitesTypes');
    this.$store.dispatch('fetchFraisTypes');
    this.$store.dispatch('fetchComptes');
  }
};
</script>

<style lang="scss" scoped></style>
