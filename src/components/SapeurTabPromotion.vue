<template>
  <div class="row">
    <div class="col-12">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Promotions</h3>
          <button type="button" class="btn btn-primary" @click="newGrade">
            Ajouter une promotion
          </button>
        </div>
        <div class="card-body">
          <table id="sap-promotions" class="table" cellspacing="0" width="100%">
            <thead>
              <tr>
                <th>Date</th>
                <th>Désignation</th>
                <th>Remarques</th>
                <th class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="g in activeSapeurGrades" :key="g.id">
                <td>{{ g.date }}</td>
                <td>{{ getGrade(g.grade_id).designation }}</td>
                <td>{{ g.remarque }}</td>
                <td>
                  <div class="d-flex justify-content-center">
                    <button
                      type="button"
                      class="btn btn-outline-primary border-0"
                      @click="editGrade(g.id)"
                    >
                      <font-awesome-icon :icon="['far', 'edit']" />
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-danger border-0"
                      @click="supprimerGrade(g.id)"
                    >
                      <font-awesome-icon :icon="['far', 'trash-alt']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex';

export default {
  name: 'SapeurTabPromotion',
  computed: {
    ...mapState({
      listGrades: state => state.grade.liste,
      activeSapeurId: state => state.sapeur.active.id,
      activeSapeurGrades: state => state.sapeur.active.grades
    }),
    ...mapGetters(['getGrade'])
  },
  mounted() {
    if (this.listGrades.length === 0) {
      this.$store.dispatch('fetchGrades');
    }
    if (this.activeSapeurGrades.length === 0) {
      this.$store.dispatch('fetchSapeurGrades', this.activeSapeurId);
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurGrades', id);
    }
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    newGrade() {
      this.$store.dispatch('resetActiveGrade');
      this.SHOW_MODAL('ModalPromotion');
    },
    editGrade(grade_id) {
      this.$store.dispatch(
        'updateActiveGrade',
        Object.assign(
          {},
          this.activeSapeurGrades.filter(f => f.id === grade_id)[0]
        )
      );
      this.SHOW_MODAL('ModalPromotion');
    },
    supprimerGrade(grade_id) {
      this.$store.dispatch('removeGrade', grade_id);
    }
  }
};
</script>

<style scoped></style>
