<script setup>
import { computed, nextTick, onUnmounted, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { allerAuContenu, titreDocument, titrePage } from "./tools/titrePage.js";

const default_layout = "default";
const loading = "empty";
const route = useRoute();
const router = useRouter();

const layout = computed(
  () => (!route.name ? loading : route.meta.layout || default_layout) + "-layout",
);

// Changement de page (navigation SPA) : met à jour le titre de l'onglet et le signale
// aux lecteurs d'écran.
// - Nouvelle page (route de premier niveau différente) : le focus va sur le titre de
//   la page (AppTitrePage), comme après un chargement complet.
// - Même page (onglet, élément sélectionné) : le focus reste où il est, le nouveau
//   titre est seulement annoncé.
// Rien n'est fait au premier chargement, ni si seuls les paramètres de requête changent.
watchEffect(() => {
  document.title = titreDocument(route);
});

const annonce = ref("");
const retirerAfterEach = router.afterEach((to, from, failure) => {
  if (failure) {
    return;
  }
  if (from.matched.length === 0 || to.path === from.path) {
    return;
  }
  const nouvellePage = to.matched[0] !== from.matched[0];
  const titre = titrePage(to);
  const titreChange = titre !== titrePage(from);
  nextTick(() => {
    if (nouvellePage && allerAuContenu()) {
      return;
    }
    if (titreChange) {
      annonce.value = titre;
    }
  });
});
onUnmounted(retirerAfterEach);
</script>

<template>
  <component :is="layout">
    <suspense>
      <router-view />
      <template #fallback></template>
    </suspense>
  </component>
  <div class="visually-hidden" aria-live="polite" aria-atomic="true">{{ annonce }}</div>
</template>

<style lang="scss">
@use "./assets/sass/main.scss" as *;
</style>
