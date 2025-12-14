<script setup>
import { computed, inject, ref } from 'vue';
import { useLocaliteStore } from '../../stores/common/Localite.js';
import { useExerciceCategorieStore } from '../../stores/exercice/ExerciceCategorie.js';
import { useModalStore } from '../../stores/common/Modal.js';
import { useAspsmsParamStore } from '../../stores/sms/AspsmsParam.js';
import { DateTime } from 'luxon';

import SapeurService from '../../services/SapeurService';
import ExerciceService from '../../services/ExerciceService';
import AspsmsParamService from '../../services/AspsmsParamService';

const localiteStore = useLocaliteStore();
const exerciceCategorieStore = useExerciceCategorieStore();
localiteStore.fetchLocalites();
const aspsmsParamStore = useAspsmsParamStore();

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});
const sending = ref(false);
const errors = ref({});

const loadingSapeurs = ref(true);
const sapeurs = ref([]);
const presences = ref([]);
Promise.all([
  SapeurService.getSapeurPourConvocationSms().then((res) => {
    sapeurs.value = res.map((s) => ({
      ...s,
      nom_prenom: `${s.nom} ${s.prenom}`,
    }));
  }),
  ExerciceService.getSapeurs(data.id).then((res) => {
    presences.value = res;
  }),
]).then(() => (loadingSapeurs.value = false));

const localite = localiteStore.liste.find((l) => l.id == data.localite_id);
const categorie = exerciceCategorieStore.liste.find(
  (l) => l.id == data.exercice_categorie_id,
);
const params = ref({
  origin: 'GestSIS',
  differe: true,
  sapeurIds: [],
  date: data.date + ' ' + data.heure,
  exerciceId: data.id,
  message:
    `Rappel\n` +
    `${DateTime.fromSQL(data.date).toLocaleString(
      DateTime.DATE_MED_WITH_WEEKDAY,
    )} ${data.heure.slice(0, 5)} ${data.lieu} à ${
      localite?.designation ?? ''
    } \n` +
    `${categorie?.designation} : ${data.communications}`,
});

const loadingCredit = ref(true);
aspsmsParamStore
  .fetchCredit()
  .then(() => (loadingCredit.value = false))
  .catch(() => (loadingCredit.value = false));

const credit = computed(() => aspsmsParamStore.credit);

const computedSapeurs = computed(() => {
  const indexedSapeurs = {};
  sapeurs.value.forEach(
    (s) =>
      (indexedSapeurs[s.id] = {
        sapeur_id: s.id,
        nom_prenom: s.nom_prenom,
        portable: s.telephones
          .filter((a) => a.telephone_type_id === 3)
          .sort((a, b) => a.priorite - b.priorite)
          .find(() => true)?.numero,
      }),
  );
  return presences.value.map((s) => ({
    ...s,
    ...(indexedSapeurs[s.sapeur_id] ?? {}),
  }));
});

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

  sending.value = true;
  AspsmsParamService.sendSms(clonedParams)
    .then(() => {
      aspsmsParamStore.fetchCredit();
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
    title: 'Convoqué',
    key: 'convoque',
    titleClass: 'align-middle text-center',
    columnClass: 'align-middle text-center',
    type: 'boolean',
  },
  {
    title: 'Excusé',
    key: 'excuse',
    titleClass: 'align-middle text-center',
    columnClass: 'align-middle text-center',
    type: 'boolean',
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
        <div class="col-8">
          <base-table
            :loading="loadingSapeurs"
            :fields="fields"
            :data="computedSapeurs"
          />
        </div>
        <div class="col-4">
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
