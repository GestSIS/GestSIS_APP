<script>
import { inject } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();

// TODO: Access activeExerciceId from props
const activeExerciceId = computed(() => store.state.exercice.active.id);
const activeExerciceData = computed(() => store.state.exercice.active.data);
const smsListe = computed(() =>
  store.state.exercice.active.sms.map((sms) => ({
    ...sms,
    date_programme: sms.date_programme.slice(0, 19),
    date_envoie: sms.date_envoie.slice(0, 19),
    numeros: sms.sms_numeros.map((s) => s.numero).join('; '),
  })),
);
const hasSmsEnvoiePermission = useHasPermission(permissions.SMS.ENVOIE);

store.dispatch('fetchExerciceSms', activeExerciceId.value);

const { showModal } = useModalStore();
const awn = inject('awn');

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
