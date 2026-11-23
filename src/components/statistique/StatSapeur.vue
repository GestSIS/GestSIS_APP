<script setup>
import StatCivilite from "/src/components/statistique/StatCivilite.vue";
import StatFonction from "/src/components/statistique/StatFonction.vue";
import StatGrade from "/src/components/statistique/StatGrade.vue";
import StatLocalite from "/src/components/statistique/StatLocalite.vue";
import StatPermis from "/src/components/statistique/StatPermis.vue";
</script>

<template>
  <div class="row">
    <stat-civilite />
    <stat-fonction />
    <stat-grade />
    <stat-localite />
    <stat-permis />
  </div>
</template>
