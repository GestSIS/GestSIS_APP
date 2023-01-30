<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats comptes</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-vehicule"
            v-model="allCompte"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-vehicule"
            >Afficher les comptes sans écriture</label
          >
        </div>
      </div>
      <div class="card-body">
        <base-table
          :fields="fields"
          :data="filteredData"
          no-data="Aucun écriture"
          :selectable="true"
        >
          <template #foot>
            <tr>
              <th>Total :</th>
              <th class="text-end">
                {{
                  filteredData.reduce(
                    (acc, a) => acc + (parseInt(a.nb) ?? 0),
                    0
                  )
                }}
              </th>
              <th class="text-end">
                {{
                  filteredData
                    .reduce((acc, a) => acc + (parseFloat(a.total) ?? 0), 0.0)
                    .toFixed(2)
                }}
              </th>
            </tr>
          </template>
        </base-table>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'StatCompte',
  data() {
    return {
      allCompte: false,
      fields: [
        { title: 'Compte', key: 'label' },
        {
          title: 'Nb écritures',
          key: 'nb',
          columnClass: 'text-end',
          titleClass: 'text-end',
        },
        {
          title: 'Total',
          key: 'total',
          columnClass: 'text-end',
          titleClass: 'text-end',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      comptes: (state) => state.compte.liste.sort((a, b) => a.tri - b.tri),
      stats: (state) => state.statistique.comptes,
    }),
    filteredData() {
      const ids = new Set(this.stats.map((c) => c.compte_id));
      return this.comptes
        .filter((e) => this.allCompte || ids.has(e.id))
        .map((c) => ({
          ...c,
          ...(this.stats.find((s) => s.compte_id == c.id) ?? {}),
        }));
    },
  },
};
</script>

<style lang="scss" scoped></style>
