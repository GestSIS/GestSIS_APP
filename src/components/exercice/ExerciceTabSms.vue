<script setup>
import { computed, ref, watchEffect } from 'vue';
import useNotification from '../../composables/useNotification.js';
import { useExerciceStore } from '../../stores/exercice/Exercice.js';
import { useModalStore } from '../../stores/common/Modal.js';
import permissions from '/src/composables/permissions.js';
import useHasPermission from '../../composables/usePermission.js';

const { id } = defineProps({
  id: {
    type: String,
    default: 'new',
  },
});

const exerciceStore = useExerciceStore();

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await Promise.all([
    exerciceStore.fetchExercice(id),
    exerciceStore.fetchExerciceSms(id),
  ]);
  loading.value = false;
});

const activeExerciceData = computed(() => exerciceStore.active.data);
const smsListe = computed(() =>
  exerciceStore.active.sms.map((sms) => ({
    ...sms,
    date_programme: sms.date_programme.slice(0, 19),
    date_envoie: sms.date_envoie.slice(0, 19),
    numeros: sms.sms_numeros.map((s) => s.numero).join('; '),
  })),
);
const hasSmsEnvoiePermission = useHasPermission(permissions.SMS.ENVOIE);

const { showModal } = useModalStore();
const awn = useNotification();

const sendSms = () => {
  if (!hasSmsEnvoiePermission.value) {
    awn.alert(
      "Permission manquante, vous n'avez pas les droits suffisant pour l'envoie de SMS",
    );
    return;
  }

  showModal({
    component: 'ModalSmsExercice',
    size: 2,
    data: activeExerciceData.value,
  });
};

const fields = [
  {
    title: 'Date envoie',
    key: 'date_programme',
    titleClass: 'align-middle',
    type: 'datetime',
  },
  {
    title: 'Programmé le',
    key: 'date_envoie',
    titleClass: 'align-middle',
    type: 'datetime',
  },
  {
    title: 'Message',
    key: 'message',
    type: 'multiline',
  },
  {
    title: 'Numéros',
    key: 'numeros',
    type: 'multiline',
  },
];
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex">
      <button
        class="btn btn-outline-primary me-2"
        :disabled="!hasSmsEnvoiePermission"
        @click="sendSms"
      >
        Nouveau SMS
      </button>
    </div>
    <base-table
      :selectable="true"
      :fields="fields"
      no-data="Aucun sms"
      :data="smsListe"
    ></base-table>
  </div>
</template>

<style scoped>
thead {
  position: sticky;
  top: 0;
  z-index: 12;
  background-color: white;
}
</style>
