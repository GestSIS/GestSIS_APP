<script setup>
import { useExcuseTypeStore } from "../../stores/exercice/ExcuseType.js";
import { useExerciceCategorieStore } from "../../stores/exercice/ExerciceCategorie.js";
import { useExcuseParamStore } from "../../stores/exercice/ExcuseParam.js";

const excuseTypeStore = useExcuseTypeStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const excuseParamStore = useExcuseParamStore();
const loadExcuses = excuseTypeStore.fetchExcuseTypes();
const loadCategories = exerciceCategorieStore.fetchExerciceCategories();
await excuseParamStore.fetchParams();
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-3">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres exercices</h3>
        </div>
        <nav class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-exercice-categorie' }"
          >
            Catégories
          </router-link>
          <router-link
            class="nav-link"
            active-class="active"
            role="tab"
            :to="{ name: 'param-exercice-excuse' }"
          >
            Excuses
          </router-link>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <router-view />
    </div>
  </div>
</template>
