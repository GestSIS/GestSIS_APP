<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter une promotion</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="cours-date">Date de la promotion</label>
        <input
          type="date"
          v-model="activeGrade.date"
          class="form-control"
          :class="{ 'is-invalid': errors['date'] }"
          id="cours-date"
        />
      </div>
      <div class="form-group">
        <label for="grade">Grade</label>
        <select
          id="grade"
          v-model="activeGrade.grade_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['grade_id'] }"
        >
          <option v-for="g in listGrades" :key="g.id" :value="g.id"
            >{{ g.designation }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="remarque">Remarque</label>
        <input
          type="text"
          v-model="activeGrade.remarque"
          class="form-control"
          :class="{ 'is-invalid': errors['remarque'] }"
          id="remarque"
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
import { mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'ModalPromotion',
  data() {
    return {
      errors: {}
    }
  },
  computed: {
    ...mapState({
      listGrades: state => state.grade.liste
    }),
    ...mapGetters(['activeSapeurId', 'activeGrade'])
  },
  mounted() {
    if (this.listGrades.length === 0) {
      this.$store.dispatch('fetchGrades')
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if ((this.activeGrade.id || 0) === 0) {
        this.$store
          .dispatch('addGrade', this.activeGrade)
          .then(() => {
            this.errors = {}
            this.HIDE_MODAL()
          })
          .catch(errors => (this.errors = errors))
      } else {
        this.$store
          .dispatch('editGrade', this.activeGrade)
          .then(() => {
            this.errors = {}
            this.HIDE_MODAL()
          })
          .catch(errors => (this.errors = errors))
      }
    }
  }
}
</script>

<style scoped></style>
