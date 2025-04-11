<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes contrôles médicaux</h3>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="table-striped"
        :fields="fields"
        :data="controlesMedicaux"
        :selectable="true"
        :hide-download="true"
        :row-class="onRowClass"
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
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';
import MesInfosService from '../../services/MesInfosService';

async function loadData(routeTo, next) {
  const loadMesControlesMedicaux = store.dispatch('fetchMesControlesMedicaux');
  const loadMedecins = store.dispatch('fetchMedecins');
  const loadControlesMedicauxTypes = store.dispatch(
    'fetchControlesMedicauxTypes'
  );

  Promise.all([
    loadMesControlesMedicaux,
    loadMedecins,
    loadControlesMedicauxTypes,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'MesControlesMedicaux',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      fields: [
        { title: 'Type', key: 'type' },
        { title: 'Medecin', key: 'medecin' },
        { title: 'Consultation', key: 'consultation', type: Date },
        { title: 'Validité', key: 'validite', type: Date },
        { title: 'Designation', key: 'designation' },
        { title: 'Accepté', key: 'accepter', type: Boolean },
        // { title: 'En cours', key: 'en_cours', type: Boolean },
        {
          title: 'Doc',
          key: 'doc',
          slot: 'doc',
          titleClass: 'align-middle text-center',
          columnClass: 'align-middle text-center',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      controlesMedicaux: (state) =>
        state.mesInfos.controlesMedicaux
          .sort((a, b) => b.validite?.localeCompare(a.validite))
          .map((c) => ({
            ...c,
            type: state.controlesMedicauxType.liste.find(
              (t) => t.id == c.controle_medical_type_id
            )?.designation,
            medecin: state.medecin.liste.find((m) => m.id == c.medecin_id)
              ?.designation,
          })),
    }),
  },
  methods: {
    downloadJustificatif({ id, filename }) {
      MesInfosService.downloadMonJustificatif(id, filename);
    },
    onRowClass(dataItem, isSelected) {
      if (isSelected) {
        return;
      }

      if (
        (dataItem.validite && Date.parse(dataItem.validite) < new Date()) ||
        !dataItem.accepter
      ) {
        return 'table-danger';
      }
    },
  },
};
</script>

<style scoped></style>
