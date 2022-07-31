<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">
        Modification des rôles de <em>{{ user.name }}</em>
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Rôles</label>
        <div v-for="role in roles" :key="role.id" class="form-check">
          <input
            :id="'r' + role.id"
            v-model="user.roles"
            type="checkbox"
            class="form-check-input"
            :value="role.id"
          />
          <label class="form-check-label" :for="'r' + role.id">{{
            role.nom
          }}</label>
        </div>
        <div class="invalid-feedback" :class="{ 'd-block': errors['roles'] }">
          {{ errors['roles'] }}
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Annuler
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Enregistrer
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalUserRole',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      errors: {},
      user: {
        name: '',
        roles: [],
      },
    };
  },
  mounted() {
    this.user = { ...this.$props.data };
  },
  computed: {
    ...mapState({
      roles: (state) => state.auth.roles,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      this.$store
        .dispatch('updateUserRoles', this.user)
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch((errors) => {
          this.errors = {
            ...errors,
          };
        });
    },
  },
};
</script>

<style scoped></style>
