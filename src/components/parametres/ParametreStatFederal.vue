<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Statistique fédéral</h3>
    </div>
    <div class="card-body table-responsive">
      <table id="materiel" class="table table-sm">
        <thead>
          <tr>
            <th>Tri</th>
            <th>Désignation</th>
            <th class="text-center">Actif</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!statsFederales.length">
            <td colspan="7">Aucune Statistique fédéral</td>
          </tr>
          <tr v-for="s in statsFederales" :key="s.id">
            <td>{{ s.tri }}</td>
            <td>{{ s.designation }}</td>
            <td class="text-center">
              <input type="checkbox" class="form-check-input" id="statut" :checked="s.statut" disabled />
              <label class="form-check-label" for="statut"></label>
            </td>
            <td>{{ s.forfait }}</td>
            <td>{{ s.unite }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'ParametreStatFederal',
  computed: {
    ...mapState({
      statsFederales: (state) => state.statFederal.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
};
</script>

<style scoped>
</style>
