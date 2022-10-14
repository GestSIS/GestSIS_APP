<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ active.id ? 'Modifier' : 'Ajouter' }} un{{
          data.textes.feminin ? 'e' : ''
        }}
        {{ data.textes.denomination }}
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div
        v-for="(field, i) in fields"
        :key="i"
        class="mb-3"
        :class="{ 'form-check': field.type === 'checkbox' }"
      >
        <!-- Checkbox -->
        <input
          v-if="field.type === 'checkbox'"
          :id="i"
          v-model="active[field.key]"
          type="checkbox"
          class="form-check-input"
        />
        <label :for="i">{{ field.label }}</label>
        <!-- Select -->
        <!-- TODO: Use generic select -->
        <select
          v-if="field.type === 'select'"
          :id="i"
          v-model="active[field.key]"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['type_unite_id'] }"
        >
          <option :value="0">-</option>
          <option v-for="u in listeUnite" :key="u.id" :value="u.id">
            {{ u.unite }}
          </option>
        </select>
        <!-- Basic input -->
        <input
          v-if="field.type !== 'checkbox' && field.type !== 'select'"
          :id="i"
          v-model="active[field.key]"
          :type="field.type ?? 'text'"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ active.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalGenericCreateUpdate',
  props: {
    data: {
      type: Object,
      default: () => ({
        textes: {
          feminin: true,
          denomination: '',
        },
        fields: [],
        data: {},
      }),
    },
  },
  data() {
    return {
      errors: {},
      active: {
        statut: 1,
        type_unite_id: 0,
      },
    };
  },
  computed: {
    ...mapState({
      listeUnite: (state) => state.unite.liste,
    }),
  },
  mounted() {
    this.active = {
      ...this.active,
      ...this.data,
    };
    if (this.data.type_unite_id === null) {
      this.active.type_unite_id = 0;
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if ((this.active.id || 0) === 0) {
        this.$store
          .dispatch('addVehicule', this.active)
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
          .dispatch('updateVehicule', this.active)
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
