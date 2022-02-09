<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">{{ role.id ? 'Modifier' : 'Ajouter' }} un rôle</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="nom">Nom</label>
        <input
          type="text"
          v-model="role.nom"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
          id="nom"
        />
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <input
          type="text"
          v-model="role.description"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
          id="description"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Permissions</label>
        <div class="form-check" v-for="permission in permissions" :key="permission.id">
          <input
            type="checkbox"
            class="form-check-input"
            :value="permission.id"
            v-model="role.permissions"
            :id="'r' + permission.id"
          />
          <label class="form-check-label" :for="'r' + permission.id">
            {{
            permission.nom
            }}
          </label>
        </div>
        <div
          class="invalid-feedback"
          :class="{ 'd-block': errors['permissions'] }"
        >{{ errors['permissions'] }}</div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button
        type="button"
        class="btn btn-primary"
        @click="save()"
      >{{ role.id ? 'Modifier' : 'Ajouter' }}</button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalRole',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      role: {
        permissions: [],
        sis_id: null,
      },
    };
  },
  mounted() {
    if (!this.data.sis_id) {
      this.role.sis_id = this.$store.state.auth.sis.activeId;
    }
    this.role = {
      ...this.role,
      ...this.data,
    };
  },
  computed: {
    ...mapState({
      permissions: (state) => state.auth.permissions,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if ((this.role.id || 0) === 0) {
        this.$store
          .dispatch('createRole', this.role)
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
          .dispatch('updateRole', this.role)
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
