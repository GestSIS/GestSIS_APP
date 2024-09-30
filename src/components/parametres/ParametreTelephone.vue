<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Téléphones</h3>
      <button type="button" class="btn btn-primary" @click="ajoutTelephone()">
        Ajouter une numéro
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        :data="listeTelephone"
        :fields="fields"
        no-data="Aucun téléphone"
        :selectable="true"
      >
        <template #actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-primary border-0"
            @click="updateTelephone(rowData)"
          >
            <font-awesome-icon :icon="['far', 'edit']" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="deleteTelephone(rowData)"
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
import store from '/src/store/index';

async function loadData(_, next) {
  const loadAppel = store.dispatch('fetchTelephones');

  Promise.all([loadAppel]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTelephone',
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Tri', key: 'tri' },
        { title: 'Nom', key: 'nom' },
        { title: 'Numéro', key: 'numero' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      listeTelephone: (state) =>
        state.telephone.liste.sort((a, b) => a.tri - b.tri),
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    ajoutTelephone() {
      this.SHOW_MODAL({ component: 'ModalTelephone', data: {} });
    },
    updateTelephone(telephone) {
      this.SHOW_MODAL({ component: 'ModalTelephone', data: { ...telephone } });
    },
    deleteTelephone(telephone) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer ce contact ?',
          question:
            "Attention, la suppression d'un contact est irréversible ! Toutes les données de ce contact seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeTelephone', telephone.id);
          }
        },
      });
    },
  },
};
</script>

<style scoped></style>
