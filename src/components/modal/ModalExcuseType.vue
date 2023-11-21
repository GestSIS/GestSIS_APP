<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeExcuse.id ? 'Modifier' : 'Ajouter' }} une excuse type
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="activeExcuse.tri"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Abréviation</label>
        <input
          id="abreviation"
          v-model="activeExcuse.abreviation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['abreviation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeExcuse.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="amendable-modal"
            v-model="activeExcuse.amende"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="amendable-modal">Amende</label>
        </div>
      </div>
      <base-select
        v-model="activeExcuse.statut"
        class="mb-3"
        :class="{ 'is-invalid': errors['compte_id'] }"
        label="Disponibilité"
        :options="[
          { id: 0, designation: 'Désactivé' },
          { id: 1, designation: 'Exercice + S\'excuser' },
          { id: 2, designation: 'Exercice' },
        ]"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeExcuse.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalExcuseType',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeExcuse: {
        statut: 1,
        amende: false,
      },
    };
  },
  computed: {
    ...mapState({
      listeExcuse: (state) => state.medecin.liste,
    }),
  },
  mounted() {
    this.activeExcuse = {
      ...this.activeExcuse,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if ((this.activeExcuse.id || 0) === 0) {
        this.$store
          .dispatch('addExcuseType', this.activeExcuse)
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
          .dispatch('updateExcuseType', this.activeExcuse)
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
