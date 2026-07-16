<script setup>
import { useExcuseTypeStore } from "../../stores/exercice/ExcuseType.js";
import { useExerciceCategorieStore } from "../../stores/exercice/ExerciceCategorie.js";
import { useExcuseParamStore } from "../../stores/exercice/ExcuseParam.js";

import ParametreExerciceCategorie from "./ParametreExerciceCategorie.vue";
import ParametreExcuseType from "./ParametreExcuseType.vue";
import ParametreExcuse from "./ParametreExcuse.vue";
import { ref } from "vue";

const excuseTypeStore = useExcuseTypeStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const excuseParamStore = useExcuseParamStore();
const loadExcuses = excuseTypeStore.fetchExcuseTypes();
const loadCategories = exerciceCategorieStore.fetchExerciceCategories();
await excuseParamStore.fetchParams();

const tab = ref("categorie");
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-3">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres exercices</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
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
