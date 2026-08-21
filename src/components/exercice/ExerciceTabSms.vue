<script setup>
import { computed, ref, watchEffect } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useExerciceStore } from "../../stores/exercice/Exercice.js";
import { useModalStore } from "../../stores/common/Modal.js";
import permissions from "/src/composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
import SmsListe from "/src/components/sms/SmsListe.vue";

const { id } = defineProps({
  id: {
    type: String,
    default: "new",
  },
});

const exerciceStore = useExerciceStore();

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await Promise.all([exerciceStore.fetchExercice(id), exerciceStore.fetchExerciceSms(id)]);
  loading.value = false;
});

const activeExerciceData = computed(() => exerciceStore.active.data);
const smsListe = computed(() => exerciceStore.active.sms);
const hasSmsEnvoiePermission = useHasPermission(permissions.SMS.ENVOIE);

const { showModal } = useModalStore();
const awn = useNotification();

const sendSms = () => {
  if (!hasSmsEnvoiePermission.value) {
    awn.alert("Permission manquante, vous n'avez pas les droits suffisant pour l'envoie de SMS");
    return;
  }

  showModal({
    component: "ModalSmsExercice",
    size: 2,
    data: activeExerciceData.value,
  });
};
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
    <sms-liste :loading="loading" :sms="smsListe" />
  </div>
</template>
