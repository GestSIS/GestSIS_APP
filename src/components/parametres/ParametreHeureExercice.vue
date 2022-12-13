<template>
  <div class="card card-primary card-outline">
    <!-- /.card-header -->
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Heures additionnelles pour exercice</h3>
      <button type="button" class="btn btn-primary" @click="ajoutHeure">
        Ajouter une heure
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :data="heureTypes"
        :fields="fields"
        no-data="Aucun heure additionelle"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateHeureType(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteHeureType(rowData)"
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
  const loadFonctions = store.dispatch('fetchFonctions');
  const loadComptes = store.dispatch('fetchComptes');
  const loadUnites = store.dispatch('fetchUnites');
  const loadHeures = store.dispatch('fetchHeuresExercice');

  Promise.all([loadFonctions, loadComptes, loadUnites, loadHeures]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreHeureExercice',
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
        { title: 'Montant', key: 'montant' },
        { title: 'Unité', key: 'unite' },
        { title: 'Compte', key: 'compte' },
        { title: 'Type', key: 'typeLabel' },
        { title: 'Catégorie', key: 'categorie' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      heureTypes: (state) =>
        state.heureExercice.liste
          .map((h) => ({
            ...h,
            unite: state.unite.liste.find((e) => e.id == h.type_unite_id)
              ?.unite,
            compte: state.compte.liste.find((e) => e.id == h.compte_id)?.label,
            categorie: state.ecritureCategorie.liste.find(
              (e) => e.id == h.ecriture_categorie_id
            )?.designation,
            typeLabel: {
              0: 'Autre',
              1: 'Solde',
              2: 'Indemnité',
              3: 'Frais forfaitaire',
              4: 'Frais effectif',
              5: 'Charges AVS/AC',
            }[h.type ?? 0],
          }))
          .sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutHeure() {
      this.SHOW_MODAL({
        component: 'ModalHeureExercice',
        data: {},
      });
    },
    updateHeureType(heure) {
      this.SHOW_MODAL({
        component: 'ModalHeureExercice',
        data: { ...heure },
      });
    },
    deleteHeureType(heure) {
      this.$store
        .dispatch('removeExerciceHeure', heure.id)
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
