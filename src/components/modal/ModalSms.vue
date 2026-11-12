<script setup>
import { computed, ref } from "vue";
import { useNotification } from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useAspsmsParamStore } from "../../stores/sms/AspsmsParam.js";

import AspsmsParamService from "../../services/AspsmsParamService";
import { useSubmit } from "../../composables/useSubmit.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const { errors, isSubmitting, submit } = useSubmit();
const loadingCredit = ref(true);
const sapeurs = ref([...data]);
const params = ref({
  message: "",
  origin: "GestSIS",
  differe: false,
  date: "",
  sapeurIds: [],
});

const aspsmsParamStore = useAspsmsParamStore();
aspsmsParamStore
  .fetchCredit()
  .then(() => (loadingCredit.value = false))
  .catch(() => (loadingCredit.value = false));

const credit = computed(() => aspsmsParamStore.credit);
const computedSapeurs = computed(() =>
  sapeurs.value.map((s) => ({
    ...s,
    sapeur_id: s.id,
    portable: s.telephones
      .filter((a) => a.telephone_type_id === 3)
      .sort((a, b) => a.priorite - b.priorite)
      .find(() => true)?.numero,
  })),
);

const { closeModal } = useModalStore();
const awn = useNotification();

const send = async () => {
  if (params.value.differe && new Date(params.value.date) < new Date()) {
    return awn.alert("Date invalide");
  }

  const clonedParams = {
    ...params.value,
    message: params.value.message
      .replaceAll("‘", "'")
      .replaceAll("’", "'")
      .replaceAll("«", '"')
      .replaceAll("»", '"'),
    contacts: computedSapeurs.value
      .filter((s) => s?.portable)
      .map((s) => ({ sapeurId: s.sapeur_id, numero: s?.portable })),
  };

  if (clonedParams.contacts.length == 0) {
    return awn.alert("Aucun numéro disponible");
  }

  const { ok } = await submit(
    () => AspsmsParamService.sendSms(clonedParams),
    "Erreur lors de l'envoi des SMS",
    "Message envoyé avec succès",
  );
  if (ok) {
    aspsmsParamStore.fetchCredit();
    closeModal();
  }
};

const fields = [
  {
    title: "Nom prénom",
    key: "nom_prenom",
    titleClass: "align-middle",
  },
  {
    title: "Portable",
    key: "portable",
    titleClass: "align-middle",
  },
];
</script>

<template>
  <form @submit.prevent="send">
    <div class="modal-header">
      <h5 class="modal-title">Convoquer par SMS</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6">
          <base-table :fields="fields" :data="computedSapeurs" />
        </div>
        <div class="col-6">
          <base-checkbox v-model="params.differe" class="mb-3" label="Envoie différé" />
          <div v-if="params.differe" class="mb-3">
            <label for="date">Date</label>
            <input
              id="date"
              v-model="params.date"
              required
              type="datetime-local"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['date'] }"
            />
          </div>
          <div class="mb-3">
            <label for="commentaire">Message ({{ 500 - params.message.length }})</label>
            <textarea
              id="commentaire"
              v-model="params.message"
              required
              minlength="1"
              maxlength="500"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['commentaire'] }"
              rows="6"
            ></textarea>
          </div>
          <p>
            Crédit : <span>{{ loadingCredit ? "chargement..." : credit }}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary" :disabled="isSubmitting">Envoyer</button>
    </div>
  </form>
</template>
