<script setup>
import { computed, onMounted, ref } from "vue";
import QRCode from "qrcode";
import { useRouter } from "vue-router";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import RecrutementService from "/src/services/RecrutementService.js";
import { useNotification } from "../../composables/useNotification.js";
import { useSubmit } from "../../composables/useSubmit.js";
import { useClipboard } from "../../composables/useClipboard.js";

const { copy } = useClipboard();

const authStore = useAuthStore();
const router = useRouter();
const { closeModal } = useModalStore();
const awn = useNotification();

const sisKey = computed(() => authStore.organisation.activeKey);

const chargement = ref(true);
const DUREE_MAX_JOURS = 7;

// Format attendu par <input type="datetime-local"> (heure locale, sans fuseau)
const versDatetimeLocal = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

const dansHeures = (heures) => new Date(Date.now() + heures * 3600 * 1000);

const finValidite = ref(versDatetimeLocal(dansHeures(24)));
const finValiditeMin = versDatetimeLocal(new Date());
const finValiditeMax = versDatetimeLocal(dansHeures(DUREE_MAX_JOURS * 24));
const { errors, isSubmitting, submit } = useSubmit();
const lien = ref("");
const qrCodeDataUrl = ref("");
const expireAt = ref(null);

const construireLien = (token) => {
  const { href } = router.resolve({
    name: "inscription-recrue",
    params: { sisKey: sisKey.value, token },
  });
  return `${window.location.origin}${href}`;
};

const afficherToken = async (token, expiration) => {
  lien.value = construireLien(token);
  expireAt.value = expiration;
  qrCodeDataUrl.value = await QRCode.toDataURL(lien.value);
};

onMounted(async () => {
  try {
    const data = await RecrutementService.getToken();
    if (data) {
      expireAt.value = data.expire_at;
    }
  } finally {
    chargement.value = false;
  }
});

const generer = async () => {
  await submit(async () => {
    const data = await RecrutementService.genererToken(new Date(finValidite.value).toISOString());
    await afficherToken(data.token, data.expire_at);
  });
};

const invalider = async () => {
  const { ok } = await submit(
    () => RecrutementService.invaliderToken(),
    "Erreur lors de l'invalidation du lien.",
  );
  if (ok) {
    lien.value = "";
    qrCodeDataUrl.value = "";
    expireAt.value = null;
    awn.success("Lien d'inscription invalidé.");
  }
};

const copyToClipboard = (value) => copy(value, "Lien copié dans le presse-papiers");
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Lien d'inscription des recrues</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div v-if="chargement" class="text-center py-3">Chargement…</div>
      <template v-else>
        <p class="text-muted">
          Partagez ce lien ou ce QR code aux futures recrues pour qu'elles saisissent elles-mêmes
          leurs informations personnelles.
        </p>
        <div v-if="!lien && expireAt" class="alert alert-info">
          Un jeton est actif (expire le {{ new Date(expireAt).toLocaleString() }}), mais son lien ne
          peut être ré-affiché — générez-en un nouveau si besoin.
        </div>
        <div v-if="!lien" class="mb-3">
          <label for="fin-validite">Valide jusqu'au (max {{ DUREE_MAX_JOURS }} jours)</label>
          <input
            id="fin-validite"
            v-model="finValidite"
            type="datetime-local"
            :min="finValiditeMin"
            :max="finValiditeMax"
            required
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['expire_at'] }"
          />
        </div>
        <div v-if="lien" class="text-center mb-3">
          <img :src="qrCodeDataUrl" alt="QR code d'inscription" class="img-fluid mb-2" />
          <div class="input-group input-group-sm mb-2">
            <input :value="lien" type="text" class="form-control form-control-sm" readonly />
            <button
              type="button"
              class="btn btn-outline-secondary"
              title="Copier dans le presse-papier"
              @click="copyToClipboard(lien)"
            >
              <font-awesome-icon :icon="['fas', 'copy']" />
            </button>
            <a
              :href="lien"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline-secondary"
              title="Ouvrir le lien dans un nouvel onglet"
            >
              <font-awesome-icon :icon="['fas', 'up-right-from-square']" />
            </a>
          </div>
          <p class="text-muted mb-0">Valide jusqu'au {{ new Date(expireAt).toLocaleString() }}</p>
        </div>
      </template>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-outline-danger me-auto"
        :class="{ invisible: !expireAt }"
        :disabled="isSubmitting"
        @click="invalider"
      >
        Invalider le lien actif
      </button>
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button :disabled="isSubmitting" type="button" class="btn btn-primary" @click="generer">
        {{ lien || expireAt ? "Regénérer" : "Générer" }}
      </button>
    </div>
  </div>
</template>
