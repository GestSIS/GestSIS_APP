<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeAlerte.id ? 'Modifier' : 'Ajouter' }} une alerte type
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="titre">Titre</label>
        <input
          id="titre"
          v-model="activeAlerte.titre"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['titre'] }"
        />
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <input
          id="description"
          v-model="activeAlerte.description"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
        />
      </div>
      <div class="form-check form-switch mb-3">
        <input
          id="switch-dernier"
          v-model="activeAlerte.dernier"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="switch-dernier"
          >Se baser uniquement sur le champ <em>validation</em> du dernier
          événement</label
        >
      </div>
      <div v-if="!activeAlerte.dernier" class="mb-3">
        <label for="seuil_min">Nb événements requis pour alerte</label>
        <input
          id="seuil_min"
          v-model="activeAlerte.seuil_min"
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['seuil_min'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeAlerte.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'ModalMateriel',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeAlerte: {
        dernier: false,
      },
    };
  },
  mounted() {
    this.activeAlerte = {
      ...this.activeAlerte,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if ((this.activeAlerte.id || 0) === 0) {
        this.$store
          .dispatch('addMatPersoAlerteType', this.activeAlerte)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
              (this.errors = {
                ...errors,
              })
          );
      } else {
        this.$store
          .dispatch('updateMatPersoAlerteType', this.activeAlerte)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => {
            this.errors = {
              ...errors,
            };
          });
      }
    },
  },
};
</script>

<style scoped></style>
