<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">
        {{ activeTypeIntervention.id ? 'Modifier' : 'Ajouter' }} un type
        d'intervention
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          type="text"
          v-model="activeTypeIntervention.tri"
          class="form-control"
          :class="{ 'is-invalid': errors['tri'] }"
          id="tri"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          type="text"
          v-model="activeTypeIntervention.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="mb-3">
        <label for="stat_intervention">Statistique</label>
        <select
          id="stat_intervention"
          v-model="activeTypeIntervention.stat_intervention_id"
          class="form-select"
          :class="{ 'is-invalid': errors['stat_intervention_id'] }"
        >
          <option v-for="s in listeStatIntervention" :key="s.id" :value="s.id">
            {{ s.designation }}
          </option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeTypeIntervention.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalTypeIntervention',
  props: {
    data: {
      type: Object,
    },
  },
  data() {
    return {
      errors: {},
      activeTypeIntervention: {},
    };
  },
  computed: {
    ...mapState({
      listeStatIntervention: (state) => state.statIntervention.liste,
    }),
  },
  mounted() {
    this.activeTypeIntervention = {
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if ((this.activeTypeIntervention.id || 0) === 0) {
        this.$store
          .dispatch('addTypeIntervention', this.activeTypeIntervention)
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
          .dispatch('updateTypeIntervention', this.activeTypeIntervention)
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
