<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter une promotion</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="cours-date">Date de la promotion</label>
        <input
          id="cours-date"
          v-model="activeGrade.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
      <div class="mb-3">
        <label for="grade">Grade</label>
        <select
          id="grade"
          v-model="activeGrade.grade_id"
          class="form-select form-select-sm"
          :class="{ 'is-invalid': errors['grade_id'] }"
        >
          <option v-for="g in grades" :key="g.id" :value="g.id">
            {{ g.designation }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label for="remarque">Remarque</label>
        <input
          id="remarque"
          v-model="activeGrade.remarque"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['remarque'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeGrade.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalSapeurPromotion',
  data() {
    return {
      errors: {},
    };
  },
  computed: {
    ...mapState({
      grades: (state) => state.grade.liste,
      activeGrade: (state) => state.grade.active,
    }),
    ...mapGetters(['activeSapeurId']),
  },
  mounted() {
    if (this.grades.length === 0) {
      this.$store.dispatch('fetchGrades');
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      if ((this.activeGrade.id || 0) === 0) {
        this.$store
          .dispatch('addSapeurGrade', this.activeGrade)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      } else {
        this.$store
          .dispatch('editSapeurGrade', this.activeGrade)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      }
    },
  },
};
</script>

<style scoped></style>
