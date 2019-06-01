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
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <component :is="component"></component>
        </div>
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
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'AppModal',
  components: {
    ModalCours: () => import(`@/components/modal/ModalCours`),
    ModalFonction: () => import(`@/components/modal/ModalFonction`),
    ModalPromotion: () => import(`@/components/modal/ModalPromotion`),
    ModalMutation: () => import(`@/components/modal/ModalMutation`)
  },
  data() {
    return {
      component: null
    }
  },
  computed: {
    ...mapState({
      visible: state => state.modal.modalVisible,
      modalComponent: state => state.modal.modalComponent
    })
  },
  created() {
    const escapeHandler = e => {
      if (e.key === 'Escape' && this.visible) {
        this.HIDE_MODAL()
      }
    }

    document.addEventListener('keydown', escapeHandler)
    this.$once('hook:destroyed', () => {
      document.removeEventListener('keydown', escapeHandler)
    })
  },
  methods: {
    ...mapMutations(['HIDE_MODAL'])
  },
  watch: {
    modalComponent(componentName) {
      if (!componentName) return

      this.component = componentName
    }
  }
}
</script>

<style scoped></style>
