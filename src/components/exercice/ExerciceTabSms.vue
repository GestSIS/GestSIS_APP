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

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'ExerciceTabSapeurs',
  props: {
    newMode: Boolean,
  },
  data: () => {
    return {
      fields: [
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
      ],
    };
  },
  computed: {
    ...mapState({
      activeExerciceId: (state) => state.exercice.active.id,
      activeExerciceData: (state) => state.exercice.active.data,
      smsListe: (state) =>
        state.exercice.active.sms.map((sms) => ({
          ...sms,
          date_programme: sms.date_programme.slice(0, 19),
          date_envoie: sms.date_envoie.slice(0, 19),
          numeros: sms.sms_numeros.map((s) => s.numero).join('; '),
        })),
      hasSmsEnvoiePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.SMS.ENVOIE),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    sendSms() {
      if (!this.hasSmsEnvoiePermission) {
        this.$awn.alert(
          "Permission manquante, vous n'avez pas les droits suffisant pour l'envoie de SMS"
        );
        return;
      }

      this.SHOW_MODAL({
        component: 'ModalSmsExercice',
        size: 2,
        data: this.activeExerciceData,
      });
    },
  },
};
</script>

<style scoped lang="scss">
thead {
  position: sticky;
  top: 0;
  z-index: 12;
  background-color: white;
}
</style>
