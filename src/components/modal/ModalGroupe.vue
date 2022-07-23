<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter un groupe</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="abreviation">No</label>
        <input
          id="no"
          v-model="groupe.no"
          type="number"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['no'] }"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Nom</label>
        <input
          id="designation"
          v-model="groupe.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="cours-precedent">Groupe parent</label>
        <select
          id="pere_id"
          v-model="groupe.pere_id"
          class="form-select form-select-sm"
        >
          <option :value="null">-</option>
          <option v-for="g in groupes" :key="g.id" :value="g.id">
            {{ (g.no ? g.no + ' ' : '') + g.designation }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <div class="form-check">
          <input
            id="modal-type"
            v-model="groupe.type"
            type="checkbox"
            class="form-check-input"
            :true-value="1"
            :false-value="0"
          />
          <label class="form-check-label" for="modal-type"
            >Groupe d'alarme</label
          >
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Ajouter
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ModalGroupe',
  data() {
    return {
      errors: {},
      groupe: {
        pere_id: null,
      },
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste,
    }),
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      this.$store
        .dispatch('createGroupe', this.groupe)
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
    },
  },
};
</script>

<style scoped></style>
