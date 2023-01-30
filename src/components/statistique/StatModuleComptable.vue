<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats modules comptables</h3>
        <div class="form-check form-switch mb-2">
          <input
            id="switch-vehicule"
            v-model="allModule"
            type="checkbox"
            class="form-check-input"
          />
          <label class="form-check-label" for="switch-vehicule"
            >Afficher les modules sans écriture</label
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
  name: 'StatModuleComptable',
  data() {
    return {
      allModule: false,
      modules: [
        { designation: 'Exercice', id: 1 },
        { designation: 'Intervention & séance', id: 2 },
        { designation: 'Frais et indemnité annuel', id: 3 },
        { designation: 'Ecritures diverses', id: 0 },
        { designation: 'Amende', id: 5 },
        { designation: 'Fiche de travail', id: 6 },
        { designation: 'Cours', id: 7 },
        { designation: 'Avs', id: 4 },
        // {designation: 'REMBOURSEMENT', id: 8},
      ],
      fields: [
        { title: 'Module', key: 'designation' },
        {
          title: 'Nb écritures',
          key: 'nb',
          columnClass: 'text-end',
          titleClass: 'text-end',
        },
        {
          title: 'Total',
          key: 'total',
          titleClass: 'text-end',
          columnClass: 'text-end',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      stats: (state) => state.statistique.modulesComptable,
    }),
    filteredData() {
      const ids = new Set(this.stats.map((c) => c.module));
      return this.modules
        .filter((e) => this.allModule || ids.has(e.id))
        .map((c) => ({
          ...c,
          ...(this.stats.find((s) => s.module == c.id) ?? {}),
        }));
    },
  },
};
</script>

<style lang="scss" scoped></style>
