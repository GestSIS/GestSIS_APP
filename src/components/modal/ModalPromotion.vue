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
          id="cours-date"
        />
      </div>
      <div class="form-group">
        <label for="grade">Grade</label>
        <select
          id="grade"
          v-model="activeGrade.grade_id"
          class="form-control select"
        >
          <option v-for="g in listGrades" :key="g.id" :value="g.id">{{
            g.designation
          }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="remarque">Remarque</label>
        <input
          type="text"
          v-model="activeGrade.remarque"
          class="form-control"
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
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'ModalPromotion',
  computed: {
    ...mapGetters(['activeSapeurId', 'listGrades', 'activeGrade'])
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
        this.$store.dispatch('addGrade', this.activeGrade).then(() => {
          this.HIDE_MODAL()
        })
      } else {
        this.$store.dispatch('editGrade', this.activeGrade).then(() => {
          this.HIDE_MODAL()
        })
      }
    }
  }
}
</script>

<style scoped></style>
