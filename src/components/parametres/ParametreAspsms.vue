<template>
  <div class="row">
    <div class="col-12 col-xl-6">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">ASPSMS</h3>
          <button type="button" class="btn btn-primary" @click="save">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="user">Utilisateur</label>
            <input
              id="username"
              v-model="params.username"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['username'] }"
            />
          </div>
          <div class="mb-3">
            <label for="password">Mot de passe</label>
            <input
              id="password"
              v-model="params.password"
              type="password"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['password'] }"
            />
          </div>
          <div class="mb-3">
            <label for="credit">Crédit actuel</label>
            <input
              id="credit"
              type="number"
              readonly
              :value="credit"
              class="form-control form-control-sm"
            />
          </div>
          <div class="mb-3">
            <a href="https://www.aspsms.com/en/login/" target="_blank"
              >Recharger des crédits</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

export default {
  name: 'ParametreAspsms',
  data() {
    return {
      errors: {},
      params: {
        username: null,
        password: null,
      },
    };
  },
  computed: {
    ...mapState({
      aspsmsParams: (state) => state.aspsmsParam.params,
      credit: (state) => state.aspsmsParam.credit,
    }),
  },
  watch: {
    aspsmsParams(value) {
      if (value && value?.username && value?.password) {
        this.params = value;
      }
    },
  },
  mounted() {
    this.params = this.aspsmsParams ? this.aspsmsParams : this.params;
  },
  methods: {
    ...mapActions(useModalStore, { SHOW_MODAL: 'showModal' }),
    async save() {
      if (this.password === '********') {
        this.$awn.success('Modifications enregistrées');
        return;
      }
      this.$store
        .dispatch('updateAspsmsParams', { ...this.params })
        .then((res) => {
          this.errors = {};
          this.$awn.success(res?.message || 'Modifications enregistrées');
        })
        .catch((e) => {
          this.errors = { ...e };
          this.$awn.alert(
            this.errors?.message || "Erreur lors de l'enregistrement",
          );
        });
    },
  },
};
</script>

<style scoped></style>
