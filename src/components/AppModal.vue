<template>
  <div>
    <!-- Modal -->
    <div
      v-if="visible"
      id="exampleModal"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
    >
      <div
        class="modal-dialog modal-dialog-scrollable"
        :class="computedSize"
        role="document"
      >
        <suspense>
          <component
            :is="component"
            :callback="callback"
            :data="data"
            class="modal-content"
          ></component>
          <template #fallback>Loading ...</template>
        </suspense>
      </div>
    </div>
    <!-- Overlay -->
    <div
      v-if="visible"
      id="modal-overlay"
      class="modal-backdrop fade show"
    ></div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue';
import { mapState, mapMutations } from 'vuex';

const components = Object.fromEntries(
  Object.entries(import.meta.glob('./modal/*.vue')).map(([key, value]) => {
    const name = key.split('/').pop().replace('.vue', '');
    return [name, defineAsyncComponent(value)];
  }),
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
        0: '', // Default
        1: 'modal-lg',
        2: 'modal-xl',
      };
      return sizesClass[this.size];
    },
  },
  watch: {
    modalComponent(componentName) {
      if (!componentName) return;

      this.component = componentName;
    },
  },
  mounted() {
    this.escapeHandler = (e) => {
      if (e.key === 'Escape' && this.visible) {
        (this.callback() ?? Promise.resolve()).then((close) => {
          if (close ?? true) {
            this.HIDE_MODAL();
          }
        });
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
};
</script>

<style scoped></style>
