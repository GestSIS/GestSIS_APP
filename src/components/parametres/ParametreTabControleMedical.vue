<script setup>
import { ref } from 'vue';
import { useStore } from 'vuex';
import ParametreMedecin from './ParametreMedecin.vue';
import ParametreControleMedicalType from './ParametreControleMedicalType.vue';

const store = useStore();
const loadMedecin = store.dispatch('fetchMedecins');
const loadType = store.dispatch('fetchControlesMedicauxTypes');
const loadLocalite = store.dispatch('fetchLocalites');

await Promise.all([loadMedecin, loadType, loadLocalite]);

const tab = ref('medecin');
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres contrôles médicaux</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'medecin' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'medecin'"
          >
            Médecins
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'type' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'type'"
          >
            Contrôles médicaux types
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-medecin v-if="tab === 'medecin'" />
      <parametre-controle-medical-type v-if="tab === 'type'" />
    </div>
  </div>
</template>
