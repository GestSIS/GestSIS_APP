<script setup>
import StatCivilite from "/src/components/statistique/StatCivilite.vue";
import StatFonction from "/src/components/statistique/StatFonction.vue";
import StatGrade from "/src/components/statistique/StatGrade.vue";
import StatLocalite from "/src/components/statistique/StatLocalite.vue";
import StatPermis from "/src/components/statistique/StatPermis.vue";
</script>

<template>
  <div class="row">
    <stat-civilite class="mb-3" />
    <stat-fonction class="mb-3" />
    <stat-grade class="mb-3" />
    <stat-localite class="mb-3" />
    <stat-permis class="mb-3" />
  </div>
</template>
