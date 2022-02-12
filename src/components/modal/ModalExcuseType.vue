<template>
  <div>
    <div class="modal-header">
      <h5
        class="modal-title"
        id="exampleModalLabel"
      >{{ activeExcuse.id ? 'Modifier' : 'Ajouter' }} une excuse type</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          type="text"
          v-model="activeExcuse.tri"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
          id="tri"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Abréviation</label>
        <input
          type="text"
          v-model="activeExcuse.abreviation"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['abreviation'] }"
          id="abreviation"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeExcuse.designation"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            type="checkbox"
            class="form-check-input"
            id="amendable-modal"
            v-model="activeExcuse.amende"
          />
          <label class="form-check-label" for="amendable-modal">Amende</label>
        </div>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            type="checkbox"
            class="form-check-input"
            id="statut-modal"
            v-model="activeExcuse.statut"
            :true-value="1"
          />
          <label class="form-check-label" for="statut-modal">Actif</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">Fermer</button>
      <button
        type="button"
        class="btn btn-primary"
        @click="save()"
      >{{ activeExcuse.id ? 'Modifier' : 'Ajouter' }}</button>
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
    },
  },
  data() {
    return {
      errors: {},
      activeExcuse: {
        statut: 1,
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
      this.activeExcuse.statut = this.activeExcuse.statut ? 1 : 0;
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
