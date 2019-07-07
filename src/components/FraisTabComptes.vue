<template>
  <div class="row">
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Comptes</h3>
          <!--          <button type="button" class="btn btn-primary" @click="manageComptes">-->
          <!--            Gestion des comptes-->
          <!--          </button>-->
        </div>
        <div class="card-body">
          <table id="sap-promotions" class="table" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th>Nom Prénom</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Designation</th>
                <th>Type de frais</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'FraisTabCompte',
  data() {
    return {
      data: [
        {
          nom: 'Georges Hulmann',
          date: new Date('2019-12-01'),
          heure: '12:00',
          frais_type: 'Exercice',
          montant: 120
        }
      ]
    }
  },
  computed: {
    // ...mapGetters([
    //   'activeSapeurGrades',
    //   'activeSapeurId',
    //   'listGrades',
    //   'getGrade'
    // ])
  },
  mounted() {
    // if (this.listGrades.length === 0) {
    //   this.$store.dispatch('fetchGrades')
    // }
    // if (this.activeSapeurGrades.length === 0) {
    //   this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId)
    // }
  },
  watch: {
    // activeSapeurId(id) {
    //   this.$store.dispatch('fetchSapeurGrades', id)
    // }
  },
  methods: {
    manageComptes() {
      //TODO
    }
    // ...mapMutations(['SHOW_MODAL']),
    // newGrade() {
    //   this.$store.dispatch('resetActiveGrade')
    //   this.SHOW_MODAL('ModalPromotion')
    // },
    // editGrade(grade_id) {
    //   this.$store.dispatch(
    //     'updateActiveGrade',
    //     Object.assign(
    //       {},
    //       this.activeSapeurGrades.filter(f => f.id === grade_id)[0]
    //     )
    //   )
    //   this.SHOW_MODAL('ModalPromotion')
    // },
    // supprimerGrade(grade_id) {
    //   this.$store.dispatch('removeGrade', grade_id)
    // }
  }
}
</script>

<style>
.m-td-0 > td {
  padding: 0 !important;
}
</style>
