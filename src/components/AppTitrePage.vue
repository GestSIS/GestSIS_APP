<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { titrePage } from "../tools/titrePage.js";

// Titre de niveau 1 de la page, lu par les lecteurs d'écran et non affiché (le fil
// d'Ariane joue ce rôle visuellement). Reçoit le focus à chaque changement de page
// (voir App.vue) : c'est lui qui annonce la nouvelle page.
const route = useRoute();
const titre = computed(() => titrePage(route) || "GestSIS");
</script>

<template>
  <h1 id="titre-page" class="visually-hidden" tabindex="-1">{{ titre }}</h1>
</template>
