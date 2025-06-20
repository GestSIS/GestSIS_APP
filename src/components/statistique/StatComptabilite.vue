<script setup>
import StatCategorieComptable from '/src/components/statistique/StatCategorieComptable.vue';
import StatModuleComptable from '/src/components/statistique/StatModuleComptable.vue';
import StatCompte from '/src/components/statistique/StatCompte.vue';
</script>

<template>
  <div class="row">
    <stat-categorie-comptable class="mb-3" />
    <stat-module-comptable class="mb-3" />
    <stat-compte class="mb-3" />
  </div>
</template>
