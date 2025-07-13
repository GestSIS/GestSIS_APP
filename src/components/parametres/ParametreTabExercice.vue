<script setup>
import { useStore } from 'vuex';

import ParametreExerciceCategorie from './ParametreExerciceCategorie.vue';
import ParametreExcuseType from './ParametreExcuseType.vue';
import ParametreExcuse from './ParametreExcuse.vue';
import { ref } from 'vue';

const store = useStore();
const loadExcuses = store.dispatch('fetchExcuseTypes');
const loadCategories = store.dispatch('fetchExerciceCategories');
await store.dispatch('fetchExcuseParams');

const tab = ref('categorie');
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-3">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres exercices</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
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
            :class="{ active: tab === 'excuse' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'excuse'"
          >
            Excuses
          </a>
        </nav>
      </div>
    </div>
    <div v-if="tab === 'categorie'" class="col-sm-12 col-xl-9">
      <parametre-exercice-categorie />
    </div>
    <div v-if="tab === 'excuse'" class="col-sm-12 col-xl-4 col-md-6">
      <parametre-excuse />
    </div>
    <div v-if="tab === 'excuse'" class="col-sm-12 col-xl-5 col-md-6">
      <parametre-excuse-type />
    </div>
  </div>
</template>
