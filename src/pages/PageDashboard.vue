<script setup>
import { computed } from 'vue';
import links from '/src/router/menu.js';
import useHasPermission from '../hooks/usePermission';
import { useAuthStore } from '../stores/auth/Auth.js';

const authStore = useAuthStore();

authStore.loadSisListe();

const sis = computed(() =>
  authStore.sis.liste.find((s) => s.id == authStore.sis.activeId),
);
const isAdmin = computed(() => authStore.admin);
const isSapeur = computed(() => authStore.sapeurId);
const perms = computed(() => authStore.sis.permissions);

const filteredLinks = computed(() => {
  return links.filter(
    (l) =>
      (!l.permission && !l.permissions && !l.admin && !l.sapeur) ||
      perms.value?.includes(l.permission) ||
      perms.value?.filter((p) => new Set(l.permissions).has(p)).length ||
      (isAdmin.value && !l.sapeur) ||
      (l.sapeur && isSapeur.value),
  );
});
</script>

<template>
  <div class="columns">
    <div class="album text-muted">
      <div class="container">
        <div class="row mt-5">
          <h2>Tableau de bord {{ sis?.nom }}</h2>
        </div>
        <div class="row">
          <div
            v-for="m in filteredLinks"
            :key="m.nom"
            class="col-6 col-sm-4 col-md-3 p-1"
          >
            <div class="d-grid">
              <router-link v-slot="{ navigate }" :to="m.to" custom>
                <button class="card text-white bg-primary" @click="navigate">
                  <div class="card-body w-100">
                    <div
                      class="d-flex justify-content-center flex-column align-items-center"
                    >
                      <font-awesome-icon :icon="m.icon" size="2x" />
                      <h3 class="h4 card-title mt-3">{{ m.nom }}</h3>
                      {{ m.label }}
                    </div>
                  </div>
                </button>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.img-fetch {
  height: auto;
  max-height: 220px;
  width: 100%;
  display: block;
}

.align-vertical {
  margin: auto;
}
</style>
