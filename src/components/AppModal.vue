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

const components = Object.fromEntries(
  require
    .context('@/components/modal/', true, /\.(js|vue)$/i)
    .keys()
    .map((key) => {
      const name = key.match(/\w+/)[0];
      return [name, () => import(`./modal/${name}`)];
    })
);

export default {
  name: 'AppModal',
  components: components,
  data() {
    return {
      component: null,
      escapeHandler: null,
    };
  },
  computed: {
    ...mapState({
      visible: (state) => state.modal.modalVisible,
      modalComponent: (state) => state.modal.modalComponent,
      callback: (state) => state.modal.modalCallback,
      size: (state) => state.modal.modalSize,
      data: (state) => state.modal.modalData,
    }),
    computedSize() {
      const sizesClass = {
        [-1]: 'modal-sm',
        1: 'modal-lg',
        2: 'modal-xl',
      };
      return sizesClass[this.size];
    },
  },
  mounted() {
    this.escapeHandler = (e) => {
      if (e.key === 'Escape' && this.visible) {
        this.callback();
        this.HIDE_MODAL();
      }
    };

    document.addEventListener('keydown', this.escapeHandler);
  },
  unmounted() {
    document.removeEventListener('keydown', this.escapeHandler);
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
  },
  watch: {
    modalComponent(componentName) {
      if (!componentName) return;

      this.component = componentName;
    },
  },
};
</script>

<style scoped></style>
