<template>
  <div class="row">
    <div class="col-12 col-xl-6 mb-3">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h4>Filtres</h4>
        </div>
        <form class="card-body p-2 pb-0">
          <div class="form-check form-switch mb-2">
            <input
              id="switch-fonction"
              v-model="allSapeurs"
              type="checkbox"
              class="form-check-input"
            />
            <label class="form-check-label" for="switch-fonction"
              >Afficher les sapeurs sans interventions</label
            >
          </div>
        </form>
      </div>
    </div>
    <div class="col-12 mb-3">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3>Stats Présences aux intervention</h3>
        </div>
        <div class="card-body table-responsive">
          <base-table
            ref="table"
            :fields="fields"
            :data="computedData"
            :selectable="true"
            :hide-download="true"
            no-data="Aucune intervention"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '/src/store/index';

async function loadData(_, next) {
  const loadLocalites = store.dispatch('fetchLocalites');
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadExercicesComptables = store.dispatch('fetchExercicesComptables');

  Promise.all([loadLocalites, loadSapeurs, loadExercicesComptables]).then(
    () => {
      store.dispatch('fetchStatistiquePresenceIntervention');
      next();
    }
  );
}

export default {
  name: 'StatExercicePresences',
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      allSapeurs: false,
      fields: [
        { title: 'Sapeur', key: 'nom_prenom' },
        { title: 'Nombre', key: 'nb' },
        { title: 'Durée', key: 'duree' },
      ],
    };
  },
  computed: {
    ...mapState({
      sapeurs: (state) => state.sapeur.liste,
      presences: (state) =>
        state.statistique.presencesIntervention.map((p) => ({
          ...p,
          duree:
            (new Date(p.fin).getTime() - new Date(p.debut).getTime()) /
            (1000 * 60 * 60),
        })),
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
    }),
    computedData() {
      const reducedPresences = this.presences.reduce((acc, val) => {
        const { nb, duree } = acc[val.sapeur_id] ?? { nb: 0, duree: 0 };
        acc[val.sapeur_id] = { nb: nb + 1, duree: duree + val.duree };
        return acc;
      }, {});

      return this.sapeurs
        .map((s) => ({
          ...s,
          ...(reducedPresences[s.id] ?? { duree: 0, nb: 0 }),
        }))
        .filter((s) => this.allSapeurs || s.duree !== 0);
    },
  },
  watch: {
    activeExerciceComptableId() {
      this.$store.dispatch('fetchStatistiquePresenceIntervention').then();
    },
  },
  mounted() {
    loadData('', () => {});
  },
  methods: {
    computeStats(presences) {
      const stats = presences
        .map((p) => [
          p.convoque ? 1 : 0,
          p.present ? 1 : 0,
          p.absent ? 1 : 0,
          p.remplace ? 1 : 0,
          p.excuse_type_id ? 1 : 0,
          p.amende ? 1 : 0,
        ])
        .reduce(
          (accumulator, p) => accumulator.map((v, i) => v + p[i]),
          [0, 0, 0, 0, 0]
        );
      return {
        convoque: stats[0],
        present: stats[1],
        absent: stats[2],
        remplace: stats[3],
        excuse: stats[4],
        amende: stats[5],
      };
    },
    formatPresence(presence) {
      if (!presence) {
        return '';
      }
      let prefix = '';
      if (!presence.convoque) {
        prefix = 'i';
      }
      if (presence.present) {
        return prefix + '✓';
      }
      if (presence.remplace) {
        return prefix + 'Rpl';
      }
      if (presence.excuse_type_id) {
        const excuse = this.excuses.find(
          (e) => e.id == presence.excuse_type_id
        );
        return prefix + excuse?.abreviation;
      }
      return prefix + '✕';
    },
    formatPresenceExport(presence) {
      if (!presence) {
        return '';
      }
      let prefix = '';
      if (!presence.convoque) {
        prefix = 'A';
      }
      if (presence.present) {
        return prefix + 'Présent';
      }
      if (presence.remplace) {
        return prefix + 'Remplacé';
      }
      if (presence.excuse_type_id) {
        const excuse = this.excuses.find(
          (e) => e.id == presence.excuse_type_id
        );
        return prefix + excuse?.designation;
      }
      return prefix + '-';
    },
    formatPresenceClass(presence) {
      if (!presence) {
        return '';
      }
      if (presence.amende) {
        return 'table-danger';
      }
      if (presence.status == -1) {
        return 'table-warning';
      }
      if (presence.status == 0) {
        return 'table-primary';
      }
      if (presence.remplace || presence.statut == 1) {
        return 'table-success';
      }
    },
    toCvs() {
      // TODO: Migrate to BaseTable and remove duplicates
      const data =
        'data:text/csv;charset=utf-8,\ufeff' +
        [
          'Sapeur',
          'Localité',
          'Fonction',
          ...this.displayExercice.map((e) => e.designation),
          'Nombre Convoqué',
          'Nombre Présent',
          'Nombre Remplacé',
          'Nombre excusé',
          'Nombre absent',
        ].join(';') +
        '\n' +
        [
          '',
          '',
          '',
          ...this.displayExercice.map((e) =>
            new Date(e.date).toLocaleDateString('fr-CH')
          ),
          '',
          '',
          '',
          '',
          '',
        ].join(';') +
        '\n' +
        this.computedData
          .map((s) =>
            [
              s.nom_prenom,
              s.localite,
              s.fonction,
              ...s.presences.map((p) => this.formatPresenceExport(p)),
              s.stats.convoque,
              s.stats.present,
              s.stats.absent,
              s.stats.remplace,
              s.stats.excuse,
              s.stats.amende,
            ].join(';')
          )
          .join('\n') +
        '\n' +
        [
          `Total : ${this.exercices.length}`,
          '',
          '',
          ...this.displayExercice.map(() => ''),
          this.computedStats.convoque,
          this.computedStats.present,
          this.computedStats.absent,
          this.computedStats.remplace,
          this.computedStats.excuse,
          this.computedStats.amende,
        ].join(';');

      // V2
      var encodedUri = encodeURI(data);
      var link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'statistiques_presences.csv');
      document.body.appendChild(link); // Required for FF

      link.click();
    },
  },
};
</script>

<style lang="scss" scoped>
#legend-container {
  max-height: 140px;
}

#legend-excuse {
  overflow-y: scroll;
}

.table-header-rotated {
  border-collapse: collapse;
}

.table-header-rotated th.rotate {
  height: 250px;
  min-width: 40px;
  white-space: nowrap;
}

.table-header-rotated th {
  white-space: nowrap;
}

.table-border {
  border-width: 1px;
}

.table-header-rotated th.rotate > div {
  -webkit-transform: translate(25px, 1px) rotate(315deg);
  -ms-transform: translate(25px, 1px) rotate(315deg);
  transform: translate(25px, 1px) rotate(315deg);
  width: 10px;
}

.table-header-rotated th.rotate > div > span {
  border-bottom: 1px solid #000;
  padding: 5px 10px 5px 0px;
}

.table-header-rotated th.row-header {
  padding: 0 10px;
  border-bottom: 1px solid #ccc;
}

thead {
  position: sticky;
  top: 0;
  z-index: 12;
  background-color: white;
}
</style>
