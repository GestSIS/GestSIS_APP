<script setup>
import { computed, onMounted, ref } from "vue";
import QRCode from "qrcode";
import { useRouter } from "vue-router";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import RecrutementService from "/src/services/RecrutementService.js";

const authStore = useAuthStore();
const router = useRouter();
const { closeModal } = useModalStore();

const sisKey = computed(() => authStore.sis.activeKey);

const chargement = ref(true);
const dureeHeures = ref(24);
const errors = ref({});
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
  errors.value = {};
  try {
    const data = await RecrutementService.genererToken(dureeHeures.value);
    await afficherToken(data.token, data.expire_at);
  } catch (err) {
    errors.value = err ?? {};
  }
};

const invalider = () => {
  RecrutementService.invaliderToken().then(() => {
    lien.value = "";
    qrCodeDataUrl.value = "";
    expireAt.value = null;
  });
};

const copyToClipboard = (value) => {
  navigator.clipboard.writeText(value);
};
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
          <label for="duree-heures">Durée de validité (heures, max 24)</label>
          <input
            id="duree-heures"
            v-model.number="dureeHeures"
            type="number"
            min="1"
            max="24"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['duree_heures'] }"
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
        @click="invalider"
      >
        Invalider le lien actif
      </button>
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="button" class="btn btn-primary" @click="generer">
        {{ lien || expireAt ? "Regénérer" : "Générer" }}
      </button>
    </div>
  </div>
</template>
