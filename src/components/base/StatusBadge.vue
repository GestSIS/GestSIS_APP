<script setup>
defineProps({
  // Résultat d'un composable de statut (ex. exerciceStatut(value),
  // interventionStatut(value), travailStatut(value)) : { label, badgeClass }.
  status: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <span class="badge rounded-pill" :class="status.badgeClass">{{ status.label }}</span>
</template>
