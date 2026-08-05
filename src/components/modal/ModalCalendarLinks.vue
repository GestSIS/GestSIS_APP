<script setup>
import { onMounted, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import useNotification from "../../composables/useNotification.js";
import IcsTokenService from "../../services/IcsTokenService.js";
import { DOC_URL } from "../../http/Env.js";

const authStore = useAuthStore();
const awn = useNotification();
const { closeModal } = useModalStore();

const loading = ref(true);
const links = ref([]);
const confirmingSisKey = ref(null);

const sisName = (sisKey) => authStore.sis.liste.find((s) => s.api_key === sisKey)?.nom ?? sisKey;

const load = () => {
  loading.value = true;
  IcsTokenService.getMyIcsLinks()
    .then((res) => {
      links.value = res ?? [];
    })
    .catch(() => {
      awn.alert("Impossible de récupérer vos liens d'agenda");
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(load);

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  awn.success("Lien copié dans le presse-papier");
};

// webcal:// déclenche l'abonnement direct dans l'app calendrier native (mobile/desktop) au clic.
// Le bouton copier, lui, renvoie volontairement la version https:// (Google Calendar "Ajouter par
// URL" n'accepte pas toujours webcal:// proprement).
const webcalUrl = (url) => url.replace(/^https?:\/\//, "webcal://");

const regenerate = (sisKey) => {
  IcsTokenService.regenerate(sisKey)
    .then(() => {
      confirmingSisKey.value = null;
      awn.success("Lien régénéré, l'ancien lien ne fonctionne plus");
      load();
    })
    .catch(() => {
      awn.alert("Impossible de régénérer ce lien");
    });
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Mon agenda</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <p>
        Abonnez votre calendrier (Google, Outlook, Apple, ...) pour recevoir automatiquement vos
        exercices et séances.
        <a :href="`${DOC_URL}/guides/agenda-ics`" target="_blank">
          Comment m'abonner avec mon téléphone ou ordinateur ?
        </a>
      </p>

      <div v-if="loading" class="text-center py-3">Chargement...</div>
      <template v-else>
        <div v-for="link in links" :key="link.sis_key" class="mb-3">
          <label class="form-label">{{ sisName(link.sis_key) }}</label>
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              :value="link.url"
              readonly
              aria-label="Copier dans le presse-papier"
            />
            <a
              class="btn btn-outline-secondary"
              :href="webcalUrl(link.url)"
              title="S'abonner directement (ouvre l'app calendrier)"
            >
              <font-awesome-icon :icon="['far', 'calendar-alt']" />
            </a>
            <button
              class="btn btn-outline-secondary"
              type="button"
              title="Copier"
              @click="copyToClipboard(link.url)"
            >
              <font-awesome-icon :icon="['far', 'clipboard']" />
            </button>
            <button
              class="btn btn-outline-secondary"
              type="button"
              title="Régénérer"
              @click="confirmingSisKey = link.sis_key"
            >
              <font-awesome-icon :icon="['fas', 'rotate']" />
            </button>
          </div>
          <div v-if="confirmingSisKey === link.sis_key" class="alert alert-warning mt-2 p-2">
            Régénérer ce lien cassera l'abonnement existant dans votre calendrier. Continuer ?
            <div class="mt-2">
              <button
                class="btn btn-sm btn-warning me-2"
                type="button"
                @click="regenerate(link.sis_key)"
              >
                Régénérer
              </button>
              <button
                class="btn btn-sm btn-secondary"
                type="button"
                @click="confirmingSisKey = null"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
        <p v-if="!links.length" class="text-muted">Aucun agenda disponible.</p>
      </template>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
    </div>
  </div>
</template>
