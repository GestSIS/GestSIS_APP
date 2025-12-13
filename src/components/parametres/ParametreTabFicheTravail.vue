<script setup>
import { useUniteStore } from '../../stores/common/Unite.js';
import { useTravailTypeStore } from '../../stores/travail/TravailType.js';
import { useCompteStore } from '../../stores/comptabilite/Compte.js';
import { useEcritureCategorieStore } from '../../stores/comptabilite/EcritureCategorie.js';
import { ref } from 'vue';
import ParametreTravailType from './ParametreTravailType.vue';
const uniteStore = useUniteStore();
const travailTypeStore = useTravailTypeStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();

const loadTravailTypes = travailTypeStore.fetchTravailTypes();
const loadUnites = uniteStore.fetchUnites();
const loadComptes = compteStore.fetchComptes();
const loadEcritureCategories = ecritureCategorieStore.fetchEcritureCategories();

await Promise.all([
  loadComptes,
  loadUnites,
  loadTravailTypes,
  loadEcritureCategories,
  loadTravailTypes,
]);
const tab = ref('type');
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres fiche travail</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'type' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'type'"
          >
            Travaux types
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-travail-type v-if="tab === 'type'" />
    </div>
  </div>
</template>
