<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Statistique fédéral</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        :data="statsFederales"
        :fields="fields"
        no-data="Aucune statistique fédérale"
        :selectable="true"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ParametreStatFederal',
  data() {
    return {
      fields: [
        { title: 'Tri', key: 'tri' },
        { title: 'Désignation', key: 'designation' },
        { title: 'Actif', key: 'statut', type: Boolean },
      ],
    };
  },
  computed: {
    ...mapState({
      statsFederales: (state) =>
        state.statFederal.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
};
</script>
