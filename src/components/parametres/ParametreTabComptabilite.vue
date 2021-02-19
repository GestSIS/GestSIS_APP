<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres comptabilité</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'compte' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'compte'"
          >
            Compte
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'categorie' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'categorie'"
          >
            Catégories
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'frais-annuel' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'frais-annuel'"
          >
            Frais annuel
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'indemnite-annuel' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'indemnite-annuel'"
          >
            Indemnité annuel
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'indemnite-exercice' }"
            href="#"
            @click.prevent="tab = 'indemnite-exercice'"
          >
            Indemnité exercice
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'indemnite-intervention' }"
            href="#"
            @click.prevent="tab = 'indemnite-intervention'"
          >
            Indemnité intervention
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'comptabilite' }"
            href="#"
            @click.prevent="tab = 'comptabilite'"
          >
            AVS
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'amende' }"
            href="#"
            @click.prevent="tab = 'amende'"
          >
            Amende
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-compte v-if="tab === 'compte'" />
      <parametre-ecriture-categorie v-if="tab === 'categorie'" />
      <parametre-frais-annuel v-if="tab === 'frais-annuel'" />
      <parametre-indemnite-annuel v-if="tab === 'indemnite-annuel'" />
      <parametre-indemnite-exercice v-if="tab === 'indemnite-exercice'" />
      <parametre-indemnite-intervention
        v-if="tab === 'indemnite-intervention'"
      />
      <parametre-avs v-if="tab === 'comptabilite'" />
      <parametre-amende v-if="tab === 'amende'" />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

import ParametreCompte from './ParametreCompte.vue';
import ParametreEcritureCategorie from './ParametreEcritureCategorie.vue';
import ParametreFraisAnnuel from './ParametreFraisAnnuel.vue';
import ParametreIndemniteAnnuel from './ParametreIndemniteAnnuel.vue';
import ParametreIndemniteExercice from './ParametreIndemniteExercice.vue';
import ParametreIndemniteIntervention from './ParametreIndemniteIntervention.vue';
import ParametreAvs from './ParametreAvs.vue';
import ParametreAmende from './ParametreAmende.vue';

async function loadData(_, next) {
  const loadAmendes = store.dispatch('fetchAmendes');
  const loadFrais = store.dispatch('fetchFraisTypes');
  const loadIndemnites = store.dispatch('fetchIndemnitesTypes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');
  const loadCategories = store.dispatch('fetchEcritureCategories');
  const loadAvsParams = store.dispatch('fetchAvsParams');
  const loadPhases = store.dispatch('fetchPhaseTypes');

  Promise.all([
    loadAmendes,
    loadFrais,
    loadIndemnites,
    loadFonctions,
    loadComptes,
    loadUnites,
    loadCategories,
    loadAvsParams,
    loadPhases,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabComptabilite',
  components: {
    ParametreCompte,
    ParametreEcritureCategorie,
    ParametreFraisAnnuel,
    ParametreIndemniteAnnuel,
    ParametreIndemniteExercice,
    ParametreIndemniteIntervention,
    ParametreAvs,
    ParametreAmende,
  },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return { tab: 'compte' };
  },
  methods: {},
};
</script>

<style scoped></style>
