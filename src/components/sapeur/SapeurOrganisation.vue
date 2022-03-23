<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Organisation</h3>
    </div>
    <!-- /.card-header -->
    <div class="card-body">
      <table id="sap-groupe" class="table table-sm">
        <thead>
          <tr>
            <th data-field="groupe">Groupe</th>
            <th data-field="designation">Désignation</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="groupeDisplay.length <= 0">
            <td colspan="4">Incorporé dans aucun groupe</td>
          </tr>
          <tr v-for="g in groupeDisplay" :key="g.id">
            <td>{{ g.no }}</td>
            <td>{{ g.designation }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'SapeurOrganisation',
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurGroupes: (state) => state.sapeur.active.groupes,
    }),
    groupeDisplay() {
      let svm = this;
      return this.activeSapeurGroupes.map((groupe) => {
        let g = svm.groupes.find((g) => g.id == groupe.groupe_id);
        return {
          id: groupe.id,
          designation: g?.designation,
          no: g?.no || '',
        };
      });
    },
  },
  mounted() {
    if (this.groupes.length === 0) {
      this.$store.dispatch('fetchGroupes').then(() => {
        this.$store.dispatch('fetchSapeurGroupes', this.activeSapeurId);
      });
    } else {
      this.$store.dispatch('fetchSapeurGroupes', this.activeSapeurId);
    }
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurGroupes', id);
    },
  },
};
</script>

<style scoped></style>
