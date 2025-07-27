<script setup>
import { computed, inject, onMounted, reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';

import AspsmsParamService from '../../services/AspsmsParamService';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const sending = ref(false);
const errors = ref({});
const loadingCredit = ref(true);
const sapeurs = ref([...data]);
const params = ref({
  message: '',
  origin: 'GestSIS',
  differe: false,
  date: '',
  sapeurIds: [],
});

const store = useStore();
store
  .dispatch('fetchAspsmsCredit')
  .then(() => (loadingCredit.value = false))
  .catch(() => (loadingCredit.value = false));

const credit = computed(() => store.state.aspsmsParam.credit);
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
const awn = inject('awn');

const send = () => {
  if (params.value.differe && new Date(params.value.date) < new Date()) {
    return awn.alert('Date invalide');
  }

  const clonedParams = {
    ...params.value,
    message: params.value.message
      .replaceAll('‘', "'")
      .replaceAll('’', "'")
      .replaceAll('«', '"')
      .replaceAll('»', '"'),
    contacts: computedSapeurs.value
      .filter((s) => s?.portable)
      .map((s) => ({ sapeurId: s.sapeur_id, numero: s?.portable })),
  };

  if (clonedParams.contacts.length == 0) {
    return awn.alert('Aucun numéro disponible');
  }

  AspsmsParamService.sendSms(clonedParams)
    .then(() => {
      store.dispatch('fetchAspsmsCredit');
      awn.success('Message envoyé avec succès');
      closeModal();
    })
    .catch((err) => {
      errors.value = err;
      sending.value = false;
      awn.alert(err?.message ?? "Erreur lors de l'envoie des SMS");
    });
};

const fields = [
  {
    title: 'Nom prénom',
    key: 'nom_prenom',
    titleClass: 'align-middle',
  },
  {
    title: 'Portable',
    key: 'portable',
    titleClass: 'align-middle',
  },
];
</script>

<template>
  <form @submit.prevent="send">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Convoquer par SMS</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6">
          <base-table :fields="fields" :data="computedSapeurs" />
        </div>
        <div class="col-6">
          <base-checkbox
            v-model="params.differe"
            class="mb-3"
            label="Envoie différé"
          />
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
            <label for="commentaire"
              >Message ({{ 500 - params.message.length }})</label
            >
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
            Crédit : <span>{{ loadingCredit ? 'chargement...' : credit }}</span>
          </p>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button type="submit" class="btn btn-primary" :disabled="sending">
        Envoyer
      </button>
    </div>
  </form>
</template>
