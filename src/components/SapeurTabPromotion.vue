<template>
  <div class="row">
    <div class="col-12">
      <h2>Coming soon!</h2>
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header">
          <button
            type="button"
            class="btn btn-primary"
            data-toggle="modal"
            data-target="#modal-promotion"
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
              <tr
                v-for="g in activeSapeurGrades"
                :key="g.id"
              >
                <td>{{ g.date }}</td>
                <td>{{ grade(g.grade_id).abreviation}}</td>
                <td>{{ grade(g.grade_id).grade }}</td>
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
import { mapGetters } from 'vuex'

export default {
  name: 'SapeurTabPromotion',
  computed: {
    ...mapGetters(['activeSapeurGrades', 'activeSapeurId', 'listGrades'])
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
    grade(grade_id) {
      return this.listGrades.filter(g => g.id === grade_id)[0]
    }
  }
}
</script>

<style scoped></style>
