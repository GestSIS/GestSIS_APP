<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes décomptes</h3>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :fields="fields"
        :data="paiements"
        :selectable="true"
        no-data="Aucun décompte pour le moment"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MesDecomptes',
  data() {
    return {
      fields: [
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
          type: 'date',
          titleClass: 'align-middle',
        },
        {
          title: 'Décompte',
          key: 'decompte',
          sortKey: 'decompte',
          titleClass: 'align-middle',
        },
        {
          title: 'Solde',
          key: 'solde',
          sortKey: 'solde',
          titleClass: 'align-middle',
        },
        {
          title: 'Indemnité',
          key: 'indemnite',
          sortKey: 'indemnite',
          titleClass: 'align-middle',
        },
        {
          title: 'Frais forfaitaires',
          key: 'frais_forfaitaire',
          sortKey: 'frais_forfaitaire',
          titleClass: 'align-middle',
        },
        {
          title: 'Frais effectifs',
          key: 'frais_effectif',
          sortKey: 'frais_effectif',
          titleClass: 'align-middle',
        },
        {
          title: 'Retenue AVS/AC',
          key: 'avs_ac',
          sortKey: 'avs_ac',
          titleClass: 'align-middle',
        },
        {
          title: 'Autre',
          key: 'autre',
          sortKey: 'autre',
          titleClass: 'align-middle',
        },
        {
          title: 'Total',
          key: 'total',
          sortKey: 'total',
          titleClass: 'align-middle',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      paiements: (state) =>
        state.mesInfos.paiements
          .map((e) => ({
            ...e,
          }))
          .sort((e1, e2) => e1.date.localeCompare(e2.date)),
    }),
  },
  methods: {
    download() {
      // TODO: download
    },
  },
};
</script>

<style scoped></style>
