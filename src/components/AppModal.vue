<template>
  <div>
    <!-- Modal -->
    <div
      class="modal fade show d-block"
      id="exampleModal"
      tabindex="-1"
      role="dialog"
      v-if="visible"
    >
      <div
        class="modal-dialog modal-dialog-scrollable"
        :class="computedSize"
        role="document"
      >
        <component
          :is="component"
          :callback="callback"
          :data="data"
          class="modal-content"
        ></component>
      </div>
    </div>
    <!-- Overlay -->
    <div
      id="modal-overlay"
      class="modal-backdrop fade show"
      v-if="visible"
    ></div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'AppModal',
  components: {
    ModalConfirmation: () => import(`@/components/modal/ModalConfirmation`),
    ModalCours: () => import(`@/components/modal/ModalCours`),
    ModalFonction: () => import(`@/components/modal/ModalFonction`),
    ModalPromotion: () => import(`@/components/modal/ModalPromotion`),
    ModalMutation: () => import(`@/components/modal/ModalMutation`),
    ModalExcuse: () => import(`@/components/modal/ModalExcuse`),
    ModalSapeurSelect: () => import(`@/components/modal/ModalSapeurSelect`),
    ModalMateriel: () => import(`@/components/modal/ModalMateriel`),
    ModalMission: () => import(`@/components/modal/ModalMission`),
    ModalAppel: () => import(`@/components/modal/ModalAppel`),
    ModalPresence: () => import(`@/components/modal/ModalPresence`),
    ModalPhase: () => import(`@/components/modal/ModalPhase`),
    ModalSapeur: () => import(`@/components/modal/ModalSapeur`),
    ModalImputerExercice: () =>
      import(`@/components/modal/ModalImputerExercice`),
    ModalImputerIntervention: () =>
      import(`@/components/modal/ModalImputerIntervention`),
    ModalImputerAnnuel: () => import(`@/components/modal/ModalImputerAnnuel`),
    ModalRapportIntervention: () => import(`@/components/modal/ModalRapportIntervention`),
    ModalMutationDesactivation: () =>
      import(`@/components/modal/ModalMutationDesactivation`)
  },
  data() {
    return {
      component: null
    };
  },
  computed: {
    ...mapState({
      visible: state => state.modal.modalVisible,
      modalComponent: state => state.modal.modalComponent,
      callback: state => state.modal.modalCallback,
      size: state => state.modal.modalSize,
      data: state => state.modal.modalData
    }),
    computedSize() {
      const sizesClass = {
        [-1]: 'modal-sm',
        1: 'modal-lg',
        2: 'modal-xl'
      };
      return sizesClass[this.size];
    }
  },
  created() {
    const escapeHandler = e => {
      if (e.key === 'Escape' && this.visible) {
        this.callback();
        this.HIDE_MODAL();
      }
    };

    document.addEventListener('keydown', escapeHandler);
    this.$once('hook:destroyed', () => {
      document.removeEventListener('keydown', escapeHandler);
    });
  },
  methods: {
    ...mapMutations(['HIDE_MODAL'])
  },
  watch: {
    modalComponent(componentName) {
      if (!componentName) return;

      this.component = componentName;
    }
  }
};
</script>

<style scoped></style>
