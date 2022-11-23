<template>
  <div class="card card-primary card-outline mb-5 table-responsive">
    <div class="card-header d-flex justify-content-between">
      <h5>Matériel a récupérer</h5>
    </div>
    <base-table
      :selectable="true"
      :fields="fields"
      no-data="Aucun matériel personnel à récupérer"
      :data="computedData"
    >
      <template #actions="props">
        <button
          title="Attribuer"
          class="btn btn-outline-primary border-0"
          @click="retourMultiple(props.rowData)"
        >
          <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
        </button>
      </template>
    </base-table>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

// import permissions from '@/store/permissions.js';

export default {
  name: 'MaterielPersonnelARecuperer',
  data() {
    return {
      errors: {},
      fields: [
        {
          title: 'Sapeur',
          key: 'nom_prenom',
          sortKey: 'nom_prenom',
        },
        {
          title: 'Nb matériel',
          key: 'nb',
          sortKey: 'nb',
        },
        {
          title: 'Fin de service',
          key: 'fin',
          sortKey: 'fin',
        },
        {
          title: 'Fin de service',
          slot: 'actions',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      aRecuperer: (state) => state.matPersoMateriel.aRecuperer,
      sapeurs: (state) => state.sapeur.liste,
    }),
    computedData() {
      return Object.values(
        this.aRecuperer.reduce((acc, m) => {
          let reccord = acc[m.sapeur_id] || {
            sapeur_id: m.sapeur_id,
            nb: 0,
            materiels: [],
          };
          reccord.nb += 1;
          reccord.materiels.push(m);
          acc[m.sapeur_id] = reccord;
          return acc;
        }, {})
      ).map((m) => {
        const s = this.sapeurs.find((s) => s.id == m.sapeur_id);
        return { ...m, nom_prenom: s?.nom + ' ' + s?.prenom, fin: '-' }; // TODO: identifier date de fin de service du sapeur !!! fin: 'TODO' };
      });
      // TODO: Ajouter fin de service
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    async retourMultiple(data) {
      this.SHOW_MODAL({
        component: 'ModalRetourMultiple',
        data: data.materiels,
      });
    },
  },
};
</script>

<style scoped></style>
