<template>
  <div class="card card-primary card-outline mb-2 table-responsive">
    <div class="card-header d-flex justify-content-between">
      <h5>Alertes</h5>
    </div>
    <base-table
      :selectable="true"
      :fields="fields"
      no-data="Aucune alerte"
      :data="computedData"
    >
      <!-- @selected="selectSapeur" -->
      <template #actions>
        <button class="btn btn-outline-primary border-0" disabled>
          <font-awesome-icon :icon="['far', 'edit']" />
        </button>
      </template>
    </base-table>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MaterielAlertes',
  data() {
    return {
      errors: {},
      fields: [
        {
          title: 'Titre',
          key: 'titre',
          sortKey: 'titre',
        },
        {
          title: 'Materiel type',
          key: 'type',
          sortKey: 'type',
        },
        {
          title: 'Numéro',
          key: 'numero',
          sortKey: 'numero',
        },
        {
          title: 'Sapeur',
          key: 'sapeur',
          sortKey: 'sapeur',
        },
        // {
        //   title: 'Actions',
        //   slot: 'actions',
        // },
      ],
    };
  },
  computed: {
    ...mapState({
      alertes: (state) => state.matPersoAlerte.liste,
      sapeurs: (state) => state.sapeur.liste,
      types: (state) => state.matPersoType.liste,
    }),
    computedData() {
      const sapeurFormat = (sapeurId) => {
        const sap = this.sapeurs.find((s) => s.id == sapeurId);
        return sap ? `${sap?.nom} ${sap?.prenom}` : '';
      };

      return this.alertes.map((a) => ({
        ...a,
        numero: a.materiel_nominal?.numero,
        type: this.types.find(
          (t) => t.id == a.materiel_nominal?.materiel?.materiel_type_id
        )?.designation,
        sapeur: sapeurFormat(
          a.materiel_nominal?.materiel?.retour == null
            ? a.materiel_nominal?.materiel?.sapeur_id
            : null
        ),
      }));
    },
  },
  methods: {
    async save() {
      //TODO
    },
  },
};
</script>

<style scoped></style>
