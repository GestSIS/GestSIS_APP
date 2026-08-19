<script setup>
import { computed, reactive, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import useNotification from "../../composables/useNotification.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const authStore = useAuthStore();
const awn = useNotification();

const errors = ref({});
const form = reactive({
  expires_in_days: 30,
  permission_ids: [],
  sis_ids: [],
  ...data,
});
const token = ref("");

const permissions = computed(() =>
  [...authStore.permissions]
    .sort((a, b) => a.tri - b.tri)
    .filter((p) => authStore.sis.permissions.includes(p.api_key)),
);

// Uniquement les SIS de l'utilisateur (tous les SIS pour un admin)
const sisListe = computed(() => authStore.availableSisListe);
// Si l'utilisateur n'appartient qu'à un seul SIS, on masque la section
// et le jeton est assigné à ce SIS par défaut.
const hasSingleSis = computed(() => sisListe.value.length === 1);

if (!form.id && hasSingleSis.value && !form.sis_ids.length) {
  form.sis_ids = [sisListe.value[0].id];
}

const { closeModal } = useModalStore();

const save = async () => {
  if (token.value) {
    closeModal();
  }

  if (!form.sis_ids?.length && !authStore.admin) {
    awn.alert("Veuillez sélectionner au moins un SIS");
    return;
  }
  authStore[form.id ? "updateApiToken" : "createApiToken"](form)
    .then((res) => {
      console.log(res);
      token.value = res.token;
    })
    .catch((err) => {
      // Le backend renvoie soit { error: { champ: [...] } } (validation),
      // soit { error: "message" } (permissions/SIS manquants).
      const payload = err?.error ?? err;
      if (typeof payload === "string") {
        awn.alert(payload);
      } else {
        errors.value = payload ?? {};
      }
    });
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  awn.success("Jeton copié dans le presse-papier");
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un jeton d'API</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div v-if="token" class="modal-body">
      <div class="alert alert-info">
        <p>
          Voici votre jeton d'API, il ne vous sera plus jamais affiché. Veuillez le copier et le
          conserver précieusement.
        </p>
      </div>

      <label for="copy-to-clipboard" class="form-label">Access Token</label>
      <div class="input-group">
        <input
          type="text"
          class="form-control"
          placeholder=""
          :value="token"
          readonly
          aria-label="Copier dans le press-papier"
          aria-describedby="copy-to-clipboard"
        />
        <button
          id="copy-to-clipboard"
          class="btn btn-outline-secondary"
          type="button"
          @click="copyToClipboard(token)"
        >
          <font-awesome-icon :icon="['far', 'clipboard']" />
        </button>
      </div>
    </div>
    <div v-if="!token" class="modal-body">
      <div class="mb-3">
        <label for="nom">Nom</label>
        <input
          id="nom"
          v-model="form.name"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['name'] }"
        />
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <input
          id="description"
          v-model="form.description"
          type="text"
          required
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
        />
      </div>
      <div class="mb-3">
        <label for="description">Validité</label>
        <div class="input-group">
          <input
            id="expires_in_days"
            v-model="form.expires_in_days"
            type="number"
            min="1"
            required
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['expires_in_days'] }"
          />
          <span class="input-group-text">jours</span>
        </div>
      </div>
      <div v-if="!hasSingleSis" class="mb-3">
        <label for="designation">Sis</label>
        <div v-for="sis in sisListe" :key="sis.id" class="form-check">
          <input
            :id="'s' + sis.id"
            v-model="form.sis_ids"
            type="checkbox"
            class="form-check-input"
            :value="sis.id"
          />
          <label class="form-check-label" :for="'s' + sis.id">{{ sis.nom }}</label>
        </div>
        <div class="invalid-feedback" :class="{ 'd-block': errors['sis_ids'] }">
          {{ errors["sis_ids"] }}
        </div>
      </div>
      <div class="mb-3">
        <label for="designation">Permissions</label>
        <div v-for="permission in permissions" :key="permission.id" class="form-check">
          <input
            :id="'r' + permission.id"
            v-model="form.permission_ids"
            type="checkbox"
            class="form-check-input"
            :value="permission.id"
          />
          <label class="form-check-label" :for="'r' + permission.id">{{ permission.nom }}</label>
        </div>
        <div class="invalid-feedback" :class="{ 'd-block': errors['permission_ids'] }">
          {{ errors["permission_ids"] }}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
