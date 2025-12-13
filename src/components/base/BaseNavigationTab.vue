<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth/Auth';

const { routes } = defineProps({
  routes: {
    type: Array,
    required: true,
  },
});

const authStore = useAuthStore();

const isAdmin = computed(() => authStore.admin);
const permissions = computed(() => authStore.sis.permissions);

const filteredRoutes = computed(() =>
  routes.filter(
    (r) =>
      isAdmin.value ||
      r.permission === undefined ||
      permissions.value.includes(r.permission),
  ),
);
</script>

<template>
  <nav class="nav nav-tabs mb-3" role="tablist">
    <router-link
      v-for="{ to, texte, exact = true } in filteredRoutes"
      :key="to"
      :to="to"
      role="tab"
      class="nav-link"
      :active-class="exact ? '' : 'active'"
      :exact-active-class="exact ? 'active' : ''"
    >
      {{ texte }}
    </router-link>
  </nav>
</template>
