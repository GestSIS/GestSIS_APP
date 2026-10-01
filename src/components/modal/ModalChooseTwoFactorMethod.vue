<script setup>
import { computed } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";

// `data.excludeMethods` : méthodes déjà actives, à ne pas re-proposer (cas
// "ajouter un second moyen" quand l'une des deux est déjà configurée).
const { data, callback } = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const { showModal, closeModal } = useModalStore();

const excludeMethods = computed(() => data?.excludeMethods ?? []);
// Contrairement au TOTP (un seul secret par compte), WebAuthn supporte
// plusieurs clés : même déjà active, l'option reste proposée (reformulée en
// "clé supplémentaire") plutôt que masquée — sinon aucune affordance dans ce
// choix ne mène vers l'ajout d'une deuxième clé physique.
const webauthnAlreadyActive = computed(() => excludeMethods.value.includes("webauthn"));

// Remplace le contenu de cette même modale par celle de la méthode choisie
// (le callback d'origine est transmis pour que l'appelant soit notifié à la
// toute fin, quelle que soit la méthode choisie). requiresStepUp/totpActive
// sont transmis tels quels (fournis par l'appelant, PageUser). `chooserData`
// (les props de CET écran, sans `error`) permet à la méthode choisie de
// revenir ici avec un message si sa tentative échoue, plutôt que de rester
// bloquée sans autre option que de fermer la fenêtre (voir ModalAddWebauthnKey).
const chooserData = { excludeMethods: excludeMethods.value, ...data };
delete chooserData.error;

const chooseTotp = () =>
  showModal({
    component: "ModalEnableTotp",
    data: { requiresStepUp: data?.requiresStepUp ?? false, chooserData },
    callback,
  });
const chooseWebauthn = () =>
  showModal({
    component: "ModalAddWebauthnKey",
    data: {
      requiresStepUp: data?.requiresStepUp ?? false,
      totpActive: data?.totpActive ?? false,
      chooserData,
    },
    callback,
  });
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">
        {{ excludeMethods.length ? "Ajouter une méthode" : "Activer la double authentification" }}
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <p class="text-body-secondary">
        Choisissez comment confirmer votre identité à la connexion, en plus de votre mot de passe.
      </p>
      <div v-if="data?.error" class="alert alert-danger">{{ data.error }}</div>
      <button
        v-if="!excludeMethods.includes('totp')"
        type="button"
        class="btn btn-outline-primary w-100 mb-2 text-start"
        @click="chooseTotp"
      >
        <strong>Application d'authentification</strong>
        <div class="small text-body-secondary">
          Google Authenticator, Authy, … — un code à 6 chiffres généré sur votre téléphone.
        </div>
      </button>
      <button
        type="button"
        class="btn btn-outline-primary w-100 text-start"
        @click="chooseWebauthn"
      >
        <strong>{{
          webauthnAlreadyActive ? "Ajouter une clé supplémentaire" : "Clé de sécurité ou biométrie"
        }}</strong>
        <div class="small text-body-secondary">
          <template v-if="webauthnAlreadyActive">
            Une clé de secours, à garder dans un endroit différent de la première.
          </template>
          <template v-else>
            Clé USB, Touch ID, Windows Hello, ou une passkey de votre téléphone.
          </template>
        </div>
      </button>
    </div>
  </div>
</template>
