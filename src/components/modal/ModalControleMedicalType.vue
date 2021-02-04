<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeType.id ? 'Modifier' : 'Ajouter' }} un contrôle médical type
      </h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="tri">Tri</label>
        <input
          type="text"
          v-model="activeType.tri"
          class="form-control"
          :class="{ 'is-invalid': errors['tri'] }"
          id="tri"
        />
      </div>
      <div class="form-group">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeType.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="form-group">
        <label for="validite">Validité</label>
        <input
          type="text"
          v-model="activeType.duree_validite"
          class="form-control"
          :class="{ 'is-invalid': errors['validite'] }"
          id="validite"
        />
      </div>
      <div class="form-group">
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="type-expirable-modal"
            v-model="activeType.expirable"
          />
          <label class="custom-control-label" for="type-expirable-modal"
            >Expirable</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeType.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalControleMedicalType',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeType: {
        actif: 1,
      },
    };
  },
  computed: {
    ...mapState({
      listeType: (state) => state.medecin.liste,
      listeLocalite: (state) => state.localite.liste,
    }),
  },
  mounted() {
    this.activeType = {
      ...this.activeType,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      //Format back dates to SQL Format
      if ((this.activeType.id || 0) === 0) {
        this.$store
          .dispatch('addControlesMedicauxTypes', this.activeType)
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
          .dispatch('updateControlesMedicauxTypes', this.activeType)
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
