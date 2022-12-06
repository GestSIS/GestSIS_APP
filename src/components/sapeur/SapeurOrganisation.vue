<template>
  <!-- general form elements -->
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Organisation</h3>
    </div>
    <!-- /.card-header -->
    <div class="card-body table-responsive">
      <base-table
        :fields="fields"
        :data="computedGroupes"
        no-data="Aucun groupe"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'SapeurOrganisation',
  data() {
    return {
      fields: [
        { title: 'Numéro', key: 'numero' },
        { title: 'Désignation', key: 'designation' },
      ],
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurGroupes: (state) => state.sapeur.active.groupes,
    }),
    computedGroupes() {
      return this.activeSapeurGroupes.map((groupe) => {
        let g = this.groupes.find((g) => g.id == groupe.groupe_id);
        return {
          id: groupe.id,
          designation: g?.designation,
          numero: g?.no || '',
        };
      });
    },
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurGroupes', id);
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
};
</script>

<style scoped></style>
