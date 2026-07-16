<script setup>
import { ref, useTemplateRef } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal.js";

import { Cropper } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";

const { callback, data } = defineProps({
  data: {
    type: [Object, String],
    default: null,
  },
  callback: {
    type: Function,
    required: true,
  },
});

const img = ref(data); //'https://images.pexels.com/photos/226746/pexels-photo-226746.jpeg',
const defaultSize = ref(null);
const fileReader = ref(new FileReader());
fileReader.value.onload = function () {
  img.value = this.result;
};

const { closeModal } = useModalStore();
const awn = useNotification();

const cropperComponent = useTemplateRef("cropper");
const loadFile = (event) => {
  var files = event.target.files || event.dataTransfer.files;
  if (!files.length) {
    return;
  }
  fileReader.value.readAsDataURL(files[0]);
};
const save = () => {
  const { canvas } = cropperComponent.value.getResult();
  const image = canvas.toDataURL();
  canvas.toBlob((blob) => {
    defaultSize.value = {
      width: 256,
    };

    callback({ image, blob })
      .then((close) => {
        if (close ?? true) {
          closeModal();
        }
      })
      .catch((err) => {
        awn.alert(err?.message || "Erreur lors de la modification de l'image");
      });
  }, "image/jpeg");
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ data ? "Modifier" : "Ajouter" }} une photo</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <div class="input-group input-group-sm">
          <input
            id="photoAjout"
            type="file"
            class="form-control form-control-sm"
            @change="loadFile"
          />
        </div>
      </div>
      <cropper
        ref="cropper"
        class="cropper"
        :src="img"
        :canvas="{
          maxWidth: 256,
        }"
        :stencil-props="{
          aspectRatio: 10 / 12,
        }"
        :default-size="defaultSize"
      ></cropper>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary" :disabled="!img">
        {{ data ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.cropper {
  height: 400px;
  background: #ddd;
}
</style>
