<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes exercices</h3>
      <button type="button" class="btn btn-primary" @click="download">
        Télécharger fichier <em>iCalendrier</em>
      </button>
    </div>
    <div class="card-body table-responsive">
      <base-table
        ref="table"
        :fields="fields"
        :data="exercices"
        :selectable="true"
        :hide-download="true"
        no-data="Aucun exercice pour le
      moment"
        :detail-row-component="detailRowComponent"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';
import { markRaw } from 'vue';
import MesHeuresSuppDetailRow from './MesHeuresSuppDetailRow.vue';

async function loadData(routeTo, next) {
  let loadMesExercices = store.dispatch('fetchMesExercices');
  let loadUnites = store.dispatch('fetchUnites');
  let loadLocalites = store.dispatch('fetchLocalites');
  let loadExerciceCategories = store.dispatch('fetchExerciceCategories');
  let loadExcuseTypes = store.dispatch('fetchExcuseTypes');

  Promise.all([
    loadUnites,
    loadMesExercices,
    loadLocalites,
    loadExerciceCategories,
    loadExcuseTypes,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'MesExercices',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      detailRowComponent: markRaw(MesHeuresSuppDetailRow),
      fields: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Heure', key: 'heure', formatter: (h) => h?.slice(0, 5) },
        { title: 'Categorie', key: 'categorie' },
        { title: 'Exercice', key: 'designation' },
        { title: 'Durée [min]', key: 'duree' },
        { title: 'Localité', key: 'localite' },
        { title: 'Lieu', key: 'lieu' },
        { title: 'Communications', key: 'communications' },
        { title: 'Convoqué', type: Boolean, key: 'convoque' },
        { title: 'Présent', type: Boolean, key: 'present' },
        { title: 'Remplacé', type: Boolean, key: 'remplace' },
        { title: 'Excuse', type: Boolean, key: 'excuse_type_id' },
        { title: 'Amende', type: Boolean, key: 'amende' },
      ],
    };
  },
  computed: {
    ...mapState({
      anneeComptableId: (state) => state.exerciceComptable.activeId,
      sisKey: (state) => state.auth.sis.activeKey,
      sisName: (state) =>
        state.auth.sis.liste.find((s) => s.id == state.auth.sis.activeId)?.nom,
      exercices: (state) =>
        state.mesInfos.exercices
          .map((e) => ({
            ...e.presence,
            ...e,
            excuse: state.excuseType.liste.find((t) => t.id == e.excuse_type_id)
              ?.designation,
            localite: state.localite.liste.find((l) => l.id == e.localite_id)
              ?.designation,
            categorie: state.exerciceCategorie.liste.find(
              (c) => c.id == e.exercice_categorie_id
            )?.designation,
          }))
          .sort((e1, e2) => e1.date.localeCompare(e2.date)),
    }),
  },
  watch: {
    anneeComptableId() {
      this.$store.dispatch('fetchMesExercices').then(() => {
        this.exercices.forEach((e) => {
          if (e.heures.length) {
            this.$refs.table.showDetailRow(e.id);
          } else {
            this.$refs.table.hideDetailRow(e.id);
          }
        });
      });
    },
  },
  mounted() {
    this.exercices
      .filter((e) => e.heures.length)
      .forEach((e) => this.$refs.table.showDetailRow(e.id));
  },
  methods: {
    download() {
      if (this.exercices.length <= 0) {
        this.$awn.alert('Aucun exercice à exporter');
      }

      const header = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:GestSIS:2.0
`;
      const footer = `\nEND:VCALENDAR`;
      const events = this.exercices
        .map(
          (e) => `BEGIN:VEVENT
UID:${this.sisKey}-${e.id}@gestsis.ch
DTSTAMP:${new Date()
            .toISOString()
            .replaceAll('-', '')
            .replaceAll(':', '')
            .slice(0, 15)}
DTSTART:${e.date.replaceAll('-', '') + 'T' + e.heure.replaceAll(':', '')}
DURATION:PT${e.duree}M
SUMMARY:${e.categorie} : ${e.designation}
ORGANIZER:${this.sisName}
DESCRIPTION:${e.communications}
CATEGORIES:${e.categorie}
LOCATION:${e.localite} ${e.lieu}
COLOR:darkred
END:VEVENT`
        )
        .join('\n');

      const data = (header + events + footer).replaceAll('\n', '\r\n');

      // V-Card for all
      const file = new Blob([data], { type: 'text/calendar' });
      const a = document.createElement('a');
      const url = URL.createObjectURL(file);

      a.href = url;
      a.download =
        `sis_${this.sisKey}_exercices_${this.annee}`
          .replaceAll(' ', '_')
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase() + '.ics';

      document.body.appendChild(a);

      a.click();
      setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    },
  },
};
</script>

<style scoped></style>
