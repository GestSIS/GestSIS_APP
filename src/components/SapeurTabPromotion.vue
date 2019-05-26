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
                v-for="promotion in activeSapeurPromotion"
                :key="promotion.id"
              >
                <td>{{ promotion.date }}</td>
                <td>{{ promotion.grade_abr }}</td>
                <td>{{ promotion.grade }}</td>
                <td>{{ promotion.remarque }}</td>
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
    ...mapGetters(['activeSapeurGrades', 'activeSapeurId'])
  },
  mounted() {
    if (this.activeSapeurGrades.length === 0) {
      this.$store.dispatch('fetchSapeurGrade', this.activeSapeurId)
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurGrades', id)
    }
  }
}
</script>

<style scoped></style>
