<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">{{ modalTitle }}</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group" v-bind:class="{ 'd-none': finDeService }">
        <label for="cours-date">Incorporation</label>
        <input
          type="date"
          v-model="activeMutation.incorporation"
          class="form-control"
          :class="{ 'is-invalid': errors['incorporation'] }"
          id="incorporation"
        />
      </div>
      <div class="form-group">
        <label for="cours-date">Fin de service</label>
        <input
          type="date"
          v-model="activeMutation.sortie"
          class="form-control"
          :class="{ 'is-invalid': errors['sortie'] }"
          id="cours-date"
        />
        <div class="invalid-feedback" v-if="errors['sortie']">
          Date invalide
        </div>
      </div>
      <div class="form-group" :class="{ 'd-none': finDeService }">
        <label for="localite">Localite</label>
        <select
          id="localite"
          v-model="activeMutation.localite_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['localite_id'] }"
        >
          <option v-for="l in listLocalitesSis" :key="l.id" :value="l.id">{{
            l.designation
          }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="motif">Motif</label>
        <input
          type="text"
          v-model="activeMutation.motif"
          class="form-control"
          :class="{ 'is-invalid': errors['motif'] }"
          id="motif"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ buttonValidateText }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalMutation',
  data() {
    return {
      errors: {},
      modalTitle: 'Ajouter une promotion'
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: state => state.sapeur.id,
      activeMutation: state => state.mutation.active
    }),
    ...mapGetters(['listLocalitesSis']),
    finDeService() {
      return this.activeMutation.action == 'finService';
    },
    buttonValidateText() {
      if (this.finDeService) {
        return 'Valider';
      }

      return this.activeMutation.id ? 'Modifier' : 'Ajouter';
    }
  },
  mounted() {
    if (this.finDeService) {
      this.modalTitle = 'Fin de service';
    }
    if (this.listLocalitesSis.length === 0) {
      this.$store.dispatch('fetchLocalites');
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL', 'SHOW_MODAL']),
    save() {
      if ((this.activeMutation.id || 0) === 0) {
        this.$store
          .dispatch('addMutation', this.activeMutation)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(errors => (this.errors = errors));
      } else {
        this.$store
          .dispatch('editMutation', this.activeMutation)
          .then(() => {
            this.errors = {};
            if (this.finDeService) {
              this.SHOW_MODAL('ModalMutationDesactivation');
            } else {
              this.HIDE_MODAL();
            }
          })
          .catch(errors => (this.errors = errors));
      }
    }
  }
};
</script>

<style scoped></style>
