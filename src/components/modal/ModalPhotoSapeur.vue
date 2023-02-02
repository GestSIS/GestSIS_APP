<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ data ? 'Modifier' : 'Ajouter' }} une photo
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
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
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :disabled="!img"
        @click="save()"
      >
        {{ data ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

import { Cropper } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

export default {
  name: 'ModalPhotoSapeur',
  components: {
    Cropper,
  },
  props: {
    data: {
      type: [Object, String],
      default: null,
    },
    callback: {
      type: Function,
      required: true,
    },
  },
  data() {
    const fr = new FileReader();
    const self = this;
    fr.onload = function () {
      self.img = this.result;
    };
    return {
      img: this.data, //'https://images.pexels.com/photos/226746/pexels-photo-226746.jpeg',
      defaultSize: null,
      fileReader: fr,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    loadFile(event) {
      var files = event.target.files || event.dataTransfer.files;
      if (!files.length) {
        return;
      }
      this.fileReader.readAsDataURL(files[0]);
    },
    async save() {
      const { canvas } = this.$refs.cropper.getResult();
      const image = canvas.toDataURL();
      canvas.toBlob((blob) => {
        this.defaultSize = {
          width: 256,
        };

        this.callback({ image, blob })
          .then((close) => {
            if (close ?? true) {
              this.HIDE_MODAL();
            }
          })
          .catch((err) => {
            this.$awn.alert(
              err?.message || "Erreur lors de la modification de l'image"
            );
          });
      }, 'image/jpeg');
    },
  },
};
</script>

<style scoped>
.cropper {
  height: 400px;
  background: #ddd;
}
</style>
