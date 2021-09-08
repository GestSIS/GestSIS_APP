<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter un groupe</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="abreviation">No</label>
        <input
          type="number"
          v-model="groupe.no"
          class="form-control"
          :class="{ 'is-invalid': errors['no'] }"
          id="no"
        />
      </div>
      <div class="form-group">
        <label for="abreviation">Nom</label>
        <input
          type="text"
          v-model="groupe.designation"
          class="form-control"
          :class="{ 'is-invalid': errors['designation'] }"
          id="designation"
        />
      </div>
      <div class="form-group">
        <label for="abreviation">Info</label>
        <input
          type="text"
          v-model="groupe.info"
          class="form-control"
          :class="{ 'is-invalid': errors['info'] }"
          id="info"
        />
      </div>
      <div class="form-group">
        <label for="cours-precedent">Groupe parent</label>
        <select id="pere_id" v-model="groupe.pere_id" class="custom-select">
          <option :value="null">-</option>
          <option v-for="g in groupes" :key="g.id" :value="g.id">
            {{ (g.no ? g.no + ' ' : '') + g.designation }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <div class="custom-control custom-checkbox">
          <input
            type="checkbox"
            class="custom-control-input"
            id="modal-type"
            v-model="groupe.type"
            :true-value="1"
            :false-value="0"
          />
          <label class="custom-control-label" for="modal-type"
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
    save() {
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
