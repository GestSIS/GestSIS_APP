import { defineStore } from 'pinia';

export const useModalStore = defineStore('Modal', {
  state: () => ({
    visible: false,
    component: null,
    callback: null,
    size: 0,
    data: null,
  }),
  actions: {
    showModal(payload) {
      this.visible = true;
      if (typeof payload === 'string') {
        this.callback = () => Promise.resolve();
        this.size = 0;
        this.data = {};
        this.component = payload;
      } else {
        this.callback = payload.callback || (() => Promise.resolve());
        this.size = payload?.size ?? 0;
        this.data = payload?.data ?? {};
        this.component = payload.component;
      }
    },
    closeModal() {
      this.visible = false;
    },
    resize(payload) {
      this.size = payload;
    },
  },
});
