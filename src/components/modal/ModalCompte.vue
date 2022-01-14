<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeCompte.id ? 'Modifier' : 'Ajouter' }} un compte
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="numero">Numéro</label>
        <input
          type="text"
          v-model="activeCompte.numero"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['numero'] }"
          id="numero"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeCompte.designation"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <base-select
        class="mb-3"
        label="Type"
        valueKey="value"
        displayKey="designation"
        :options="[
          { value: 0, designation: 'Passif' },
          { value: 1, designation: 'Actif' },
        ]"
        v-model="activeCompte.actif"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeCompte.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex';

export default {
  name: 'ModalCompte',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeCompte: {},
    };
  },
  mounted() {
    this.activeCompte = {
      ...this.activeCompte,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      //Format back dates to SQL Format
      if ((this.activeCompte.id || 0) === 0) {
        this.$store
          .dispatch('addCompte', this.activeCompte)
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
          .dispatch('updateCompte', this.activeCompte)
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
