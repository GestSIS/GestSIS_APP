<template>
  <div class="row">
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Promotions</h3>
          <button
            type="button"
            class="btn btn-primary"
            @click="SHOW_MODAL('ModalPromotion')"
          >
            Ajouter une promotion
          </button>
        </div>
        <div class="card-body">
          <table id="sap-promotions" class="table" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th data-field="date">Date</th>
                <th data-field="Abr">Abr</th>
                <th data-field="designation">Désignation</th>
                <th data-field="remarques">Remarques</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in activeSapeurGrades" :key="g.id">
                <td>{{ g.date }}</td>
                <td>{{ getGrade(g.grade_id).abreviation }}</td>
                <td>{{ getGrade(g.grade_id).designation }}</td>
                <td>{{ g.remarque }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'SapeurTabPromotion',
  computed: {
    ...mapGetters([
      'activeSapeurGrades',
      'activeSapeurId',
      'listGrades',
      'getGrade'
    ])
  },
  mounted() {
    if (this.listGrades.length === 0) {
      this.$store.dispatch('fetchGrades')
    }
    if (this.activeSapeurGrades.length === 0) {
      this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId)
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurGrades', id)
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL'])
  }
}
</script>

<style scoped></style>
