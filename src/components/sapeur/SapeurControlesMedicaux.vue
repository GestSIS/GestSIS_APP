<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Contrôles médicaux</h3>
    </div>
    <form role="form">
      <div class="card-body">
        <base-table
          :fields="fields"
          :data="controles"
          no-data="Aucun contrôle médical"
        >
          <template #doc="{ rowData }">
            <button
              v-if="rowData.filename"
              class="btn"
              @click="downloadJustificatif(rowData)"
            >
              <font-awesome-icon :icon="['far', 'file-pdf']" />
            </button>
          </template>
        </base-table>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ControlesMedicauxService from '@/services/ControlesMedicauxService.js';

import store from '@/store/index';
async function loadData(routeTo, next) {
  if (routeTo.params.id == 'ajout') {
    next();
  } else {
    const sapeurId = parseInt(routeTo.params.id);
    await store.dispatch('selectSapeur', sapeurId);

    const loadTelephones = store.dispatch('fetchTelephoneTypes');
    const loadTelephonesType = store.dispatch('fetchSapeurTelephones');
    const loadSapeur = store.dispatch('fetchSapeur', sapeurId);

    Promise.all([loadSapeur, loadTelephones, loadTelephonesType]).then(() => {
      next();
    });
  }
}

export default {
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Type', key: 'controle_medical_type' },
        { title: 'Médecin', key: 'medecin' },
        { title: 'Consultation', key: 'consultation', type: Date },
        { title: 'Validité', key: 'validite', type: Date },
        { title: 'Désignation', key: 'designation' },
        { title: 'Accepté', key: 'accepte', type: Boolean },
        { title: 'En cours', key: 'en_cours', type: Boolean },
        { title: 'Doc', slot: 'doc' },
      ],
    };
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      controles: (state) =>
        state.sapeur.active.controles.map((c) => ({
          ...c,
          controle_medical_type: state.controlesMedicauxType.liste.find(
            (l) => l.id == c.controle_medical_type_id
          )?.designation,
          medecin: state.medecin.liste.find((l) => l.id == c.medecin_id)
            ?.designation,
        })),
    }),
  },
  watch: {
    activeSapeurId(id) {
      this.$store.dispatch('fetchSapeurControlesMedicaux', id);
    },
  },
  mounted() {
    this.$store.dispatch('fetchSapeurControlesMedicaux', this.activeSapeurId);
    this.$store.dispatch('fetchMedecins', this.activeSapeurId);
    this.$store.dispatch('fetchControlesMedicauxTypes', this.activeSapeurId);
  },
  methods: {
    downloadJustificatif({ id, filename }) {
      ControlesMedicauxService.downloadJustificatif(id, filename);
    },
  },
};
</script>

<style></style>
