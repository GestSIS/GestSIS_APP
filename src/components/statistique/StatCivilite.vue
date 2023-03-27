<template>
  <div class="col-12 col-md-6 col-xl-4">
    <div class="card card-primary card-outline">
      <div class="card-header d-flex justify-content-between">
        <h3>Stats sapeurs</h3>
      </div>
      <div class="card-body">
        <base-table
          :fields="fields"
          :data="filteredCivilite"
          no-data="Aucun sapeur"
          :selectable="true"
        >
          <template #foot>
            <tr>
              <th>Total :</th>
              <th>
                {{
                  Object.values(occurences).reduce(
                    (partialSum, a) => partialSum + (parseInt(a) ?? 0),
                    0
                  )
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
  name: 'StatCivilite',
  data() {
    return {
      allCivilites: false,
      fields: [
        { title: 'Civilité', key: 'designation' },
        { title: 'Nombre', key: 'quantite' },
      ],
    };
  },
  computed: {
    ...mapState({
      civilites: (state) => state.baseData.civilites,
      sapeurCivilites: (state) => state.statistique.civilites,
    }),
    occurences() {
      return this.sapeurCivilites.reduce(
        (prev, { civilite_id, nb }) => (
          (prev[civilite_id] = (prev[civilite_id] ?? 0) + parseFloat(nb)), prev
        ),
        {}
      );
    },
    filteredCivilite() {
      return this.civilites.map((e) => ({
        ...e,
        quantite: this.occurences[e.id] ?? 0,
      }));
    },
  },
};
</script>

<style lang="scss" scoped></style>
