<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Indemnités intervention</h3>
      <button type="button" class="btn btn-primary" @click="ajoutIndemnite">
        Ajouter une indemnité
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :data="indemnitesIntervention"
        :fields="fields"
        no-data="Aucune indemnité"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateIndemnite(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="removeIndemnite(rowData)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
      </base-table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

async function loadData(_, next) {
  const loadIndemnites = store.dispatch('fetchFraisIndemnitesTypes');
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');
  const loadPhases = store.dispatch('fetchPhaseTypes');

  Promise.all([
    loadIndemnites,
    loadFonctions,
    loadComptes,
    loadUnites,
    loadPhases,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreIndemniteIntervention',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Désignation', key: 'designation' },
        { title: 'Type', key: 'type_display' },
        { title: 'Tarif', key: 'tarif' },
        { title: 'Tarif min', key: 'tarif_min' },
        { title: 'Pour', key: 'tarif_min_pour' },
        { title: 'Unité', key: 'unite' },
        { title: 'Pro-rata', key: 'tarif_min_pro_rata', type: Boolean },
        { title: 'Phase', key: 'phase' },
        { title: 'Taux week-end', key: 'taux_weekend' },
        { title: 'Taux nuit', key: 'taux_nuit' },
        { title: 'Compte', key: 'compte' },
        { title: "Catégorie d'écriture", key: 'categorie' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      indemnitesIntervention: (state) =>
        state.imputation.fraisIndemnites.interventions
          .map((e) => ({
            ...e,
            unite: state.unite.liste.find((u) => u.id == e.type_unite_id)
              ?.unite,
            compte: state.compte.liste.find((c) => c.id == e.compte_id)?.label,
            categorie: state.ecritureCategorie.liste.find(
              (c) => c.id == e.ecriture_categorie_id
            )?.designation,
            phase: state.phaseType.liste.find((p) => p.id == e.phase_id)
              ?.designation,
            type_display: {
              0: 'Autre',
              1: 'Solde',
              2: 'Indemnité',
              3: 'Frais forfaitaire',
              4: 'Frais effectif',
              5: 'Charges AVS/AC',
            }[e.type ?? 0],
          }))
          .sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutIndemnite() {
      this.SHOW_MODAL({
        component: 'ModalIndemniteIntervention',
        data: {},
      });
    },
    updateIndemnite(indemnite) {
      this.SHOW_MODAL({
        component: 'ModalIndemniteIntervention',
        data: { ...indemnite },
      });
    },
    removeIndemnite(indemnite) {
      this.$store.dispatch('removeIndemniteIntervention', indemnite.id);
    },
  },
};
</script>

<style scoped></style>
