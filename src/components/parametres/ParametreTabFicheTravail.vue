<script setup>
import { useStore } from 'vuex';
import { ref } from 'vue';
import ParametreTravailType from './ParametreTravailType.vue';
const store = useStore();

const loadTravailTypes = store.dispatch('fetchTravailTypes');
const loadUnites = store.dispatch('fetchUnites');
const loadComptes = store.dispatch('fetchComptes');
const loadEcritureCategories = store.dispatch('fetchEcritureCategories');

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
