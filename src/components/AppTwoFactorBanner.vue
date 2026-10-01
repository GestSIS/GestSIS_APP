<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth/Auth.js";

const authStore = useAuthStore();
const router = useRouter();

// Le nudge ne doit plus s'afficher une fois le 2FA activé, même si le store
// n'a pas encore rechargé la policy (ex. juste après confirmTwoFactor()).
const nudge = computed(() =>
  authStore.user?.two_factor_enabled ? null : authStore.twoFactorNudge,
);

// Recalculé depuis la date plutôt que repris du serveur : la valeur conservée
// dans le stockage local (rechargement de page) peut dater de plusieurs jours.
const daysRemaining = computed(() =>
  nudge.value
    ? Math.max(0, Math.floor((new Date(nudge.value.enforcedAt) - Date.now()) / 86400000))
    : 0,
);

const goToSettings = () => router.push({ name: "utilisateur", query: { tab: "2fa" } });
</script>

<template>
  <div
    v-if="nudge"
    class="alert alert-warning d-flex align-items-center justify-content-between mb-0 rounded-0"
  >
    <span>
      La double authentification (2FA) devient obligatoire sur votre compte à partir du
      {{ new Date(nudge.enforcedAt).toLocaleDateString("fr-CH") }}
      ({{ daysRemaining }} jour{{ daysRemaining > 1 ? "s" : "" }} restant{{
        daysRemaining > 1 ? "s" : ""
      }}).
    </span>
    <button type="button" class="btn btn-sm btn-warning text-nowrap ms-3" @click="goToSettings">
      Activer maintenant
    </button>
  </div>
</template>
