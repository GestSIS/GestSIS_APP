<script setup>
// Fil d'Ariane : « Accueil » puis les liens donnés, et l'élément courant dans le slot.
const { items } = defineProps({
  // [{ label: "Exercices", to: { name: "exercices" } }]
  items: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb m-3">
      <li class="breadcrumb-item">
        <router-link :to="{ name: 'accueil' }">Accueil</router-link>
      </li>
      <li v-for="item in items" :key="item.label" class="breadcrumb-item">
        <router-link :to="item.to">{{ item.label }}</router-link>
      </li>
      <li class="breadcrumb-item active" aria-current="page">
        <slot />
      </li>
    </ol>
  </nav>
</template>
