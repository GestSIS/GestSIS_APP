<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter un médecin</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="motif">Désignation</label>
        <input
          type="text"
          v-model="activeMedecin.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="motif"
        />
      </div>
      <div class="form-group">
        <label for="motif">Adresse</label>
        <input
          type="text"
          v-model="activeMedecin.adresse"
          class="form-control"
          :class="{ 'is-invalid': errors['adresse'] }"
          id="motif"
        />
      </div>
      <div class="form-group">
        <label for="mission">Localité</label>
        <select
          id="mission"
          v-model="activeMedecin.localite_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['localite_id'] }"
        >
          <option v-for="l in listeLocalite" :key="l.id" :value="l.id">
            {{ localite(l) }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="medecin-actif-modal"
            v-model="activeMedecin.actif"
          />
          <label class="custom-control-label" for="medecin-actif-modal"
            >Actif</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeMedecin.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalMedecin',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeMedecin: {
        actif: 1,
      },
    };
  },
  computed: {
    ...mapState({
      listeMedecin: (state) => state.medecin.liste,
      listeLocalite: (state) => state.localite.liste,
    }),
  },
  mounted() {
    this.activeMedecin = {
      ...this.activeMedecin,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    localite(localite) {
      return localite?.designation;
    },
    save() {
      //Format back dates to SQL Format
      if ((this.activeMedecin.id || 0) === 0) {
        this.$store
          .dispatch('addMedecin', this.activeMedecin)
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
          .dispatch('updateMedecin', this.activeMedecin)
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
