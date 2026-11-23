<script setup>
import StatCategorieComptable from "/src/components/statistique/StatCategorieComptable.vue";
import StatModuleComptable from "/src/components/statistique/StatModuleComptable.vue";
import StatCompte from "/src/components/statistique/StatCompte.vue";
</script>

<template>
  <div class="row">
    <stat-categorie-comptable />
    <stat-module-comptable />
    <stat-compte />
  </div>
</template>
