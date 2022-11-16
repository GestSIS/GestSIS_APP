<template>
  <div class="card card-primary card-outline mb-3">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Mes exercices</h3>
      <button type="button" class="btn btn-primary" @click="download">
        Télécharger fichier <em>iCalendrier</em>
      </button>
    </div>
    <div class="card-body">
      <base-table
        :fields="fields"
        :data="filteredExercices"
        :selectable="true"
        no-data="Aucun exercice pour le moment"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'MesExercices',
  data() {
    return {
      annee: 2022,
      fields: [
        {
          title: 'Date',
          key: 'date',
          sortKey: 'date',
          type: 'date',
          titleClass: 'align-middle',
        },
        {
          title: 'Heure',
          key: 'heure',
          sortKey: 'heure',
          formatter: (h) => h.slice(0, 5),
          titleClass: 'align-middle',
        },
        {
          title: 'Categorie',
          key: 'categorie',
          sortKey: 'categorie',
          titleClass: 'align-middle',
        },
        {
          title: 'Exercice',
          key: 'designation',
          sortKey: 'designation',
          titleClass: 'align-middle',
        },
        {
          title: 'Durée [min]',
          key: 'duree',
          sortKey: 'duree',
          titleClass: 'align-middle',
        },
        {
          title: 'Localité',
          key: 'localite',
          sortKey: 'localite',
          titleClass: 'align-middle',
        },
        {
          title: 'Lieu',
          key: 'lieu',
          sortKey: 'lieu',
          titleClass: 'align-middle',
        },
        {
          title: 'Communications',
          key: 'communications',
          sortKey: 'communications',
          titleClass: 'align-middle',
        },
      ],
    };
  },
  computed: {
    ...mapState({
      sisKey: (state) => state.auth.sis.activeKey,
      exercices: (state) =>
        state.mesInfos.exercices
          .map((e) => ({
            ...e,
            localite: state.localite.liste.find((l) => l.id == e.localite_id)
              ?.designation,
            categorie: state.exerciceCategorie.liste.find(
              (c) => c.id == e.exercice_categorie_id
            )?.designation,
          }))
          .sort((e1, e2) => e1.date.localeCompare(e2.date)),
    }),
    filteredExercices() {
      return this.exercices;
    },
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
      const events = this.filteredExercices
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
COMMENT:${e.communications}
CATEGORIES:${e.categorie}
LOCATION:${e.localite} ${e.lieu}
END:VEVENT`
        )
        .join('\n');

      const data = (header + events + footer).replaceAll('\n', '\r\n');

      // V-Card for all
      const file = new Blob([data], { type: 'text/plain' });
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
