<template>
  <div class="card card-primary card-outline table-responsive mb-3">
    <div class="card-header d-flex justify-content-between">
      <h5>Matériel à récupérer</h5>
    </div>
    <base-table
      :selectable="true"
      :fields="fields"
      no-data="Aucun matériel personnel à récupérer"
      :data="computedData"
    >
      <template #actions="{ rowData }">
        <button
          title="Retour"
          class="btn btn-outline-primary border-0"
          @click="retourMultiple(rowData)"
        >
          <font-awesome-icon :icon="['fas', 'person-circle-minus']" />
        </button>
      </template>
    </base-table>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

// import permissions from '/src/store/permissions.js';

export default {
  name: 'MaterielPersonnelARecuperer',
  data() {
    return {
      errors: {},
      fields: [
        {
          title: 'Sapeur',
          key: 'nom_prenom',
        },
        {
          title: 'Nb matériel',
          key: 'nb',
        },
        {
          title: 'Fin de service',
          key: 'fin',
        },
        {
          title: 'Actions',
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
    indexedSapeurs() {
      const saps = {};
      this.sapeurs.array.forEach((s) => (saps[s.id] = s));
      return saps;
    },
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
        return {
          ...m,
          nom_prenom: this.indexedSapeurs[m.sapeur_id]?.nom_prenom,
          fin: '-',
        }; // TODO: identifier date de fin de service du sapeur !!! fin: 'TODO' };
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
