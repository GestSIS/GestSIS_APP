<script setup>
import { computed } from "vue";
import { useAuthStore } from "../../stores/auth/Auth";

const { routes } = defineProps({
  routes: {
    type: Array,
    required: true,
  },
});

const authStore = useAuthStore();

const isAdmin = computed(() => authStore.admin);
const permissions = computed(() => authStore.organisation.permissions);

// `permission` : une permission requise ; `permissions` : au moins une de la liste
const filteredRoutes = computed(() =>
  routes.filter(
    (r) =>
      isAdmin.value ||
      (r.permission === undefined && r.permissions === undefined) ||
      permissions.value.includes(r.permission) ||
      (r.permissions ?? []).some((p) => permissions.value.includes(p)),
  ),
);
</script>

<template>
  <nav class="nav nav-tabs mb-3" role="tablist">
    <template
      v-for="{ to, texte, exact = true, badge, badgeClass, disabled, title } in filteredRoutes"
      :key="to"
    >
      <span
        v-if="disabled"
        class="nav-link disabled"
        role="tab"
        aria-disabled="true"
        :title="title"
      >
        {{ texte }}
      </span>
      <router-link
        v-else
        :to="to"
        role="tab"
        class="nav-link"
        :title="title"
        :active-class="exact ? '' : 'active'"
        :exact-active-class="exact ? 'active' : ''"
      >
        {{ texte }}
        <span v-if="badge" class="badge rounded-pill ms-1" :class="badgeClass">{{ badge }}</span>
      </router-link>
    </template>
  </nav>
</template>
