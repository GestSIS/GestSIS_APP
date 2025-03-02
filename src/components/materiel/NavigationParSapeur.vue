<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});

const store = useStore();
store.dispatch('fetchListeSapeur');

const sapeurs = computed(() =>
  store.state['sapeur'].liste.filter((s) => s.actif)
);
</script>

<template>
  <ul class="list-group list-group-flush">
    <li v-if="sapeurs.length === 0">
      <td class="border-bottom-0">Aucun sapeur</td>
    </li>
    <router-link
      v-for="item in sapeurs"
      :key="item.id"
      v-slot="{ navigate, isExactActive }"
      custom
      :to="{
        name: 'materiel-par-sapeur-details',
        params: { id: item.id },
      }"
    >
      <a
        class="nav-link list-group-item list-group-item-action pt-1 pb-1"
        href="#"
        role="link"
        :class="{ active: isExactActive }"
        @click="navigate"
        >{{ item.nom_prenom }}
      </a>
    </router-link>
  </ul>
</template>

<style scoped></style>
