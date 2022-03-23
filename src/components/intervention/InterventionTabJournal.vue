<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-12 col-md-4 col-xl-4 ps-0">
        <ul class="timeline">
          <li v-for="e in events" :key="e.i" class="timeline-item">
            <div class="timeline-badge" :class="e.colorClass">
              <font-awesome-icon :icon="icon(e.type)" />
              <i class="glyphicon glyphicon-edit"></i>
            </div>
            <div class="timeline-panel">
              <div class="timeline-heading">
                <h5 class="timeline-title">{{ e.title }}</h5>
                <div class="timeline-panel-controls">
                  <div class="controls"></div>
                  <div class="timestamp">
                    <small class="text-muted">{{ formatTime(e.date) }}</small>
                  </div>
                </div>
              </div>
              <div class="timeline-body small">
                <p>{{ e.description }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="col-sm-12 col-md-8 col-xl-8">
        <!-- general form elements -->
        <div class="card card-primary card-outline mb-3">
          <!-- /.card-header -->
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Appels</h3>
            <button
              type="button"
              class="btn btn-primary"
              @click="newAppel"
              v-if="hasEditPermission"
            >Ajouter un appel</button>
          </div>
          <div class="card-body">
            <table id="int-appels" class="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Numéro</th>
                  <th>Nom</th>
                  <th>Commentaire</th>
                  <th class="text-center" v-if="hasEditPermission">Actions</th>
                </tr>
              </thead>
              <tbody id="appels">
                <tr v-if="appels.length <= 0">
                  <td :colspan="hasEditPermission ? 5 : 4">Aucun appel</td>
                </tr>
                <tr v-for="a in appels" :key="a.id">
                  <td>{{ formatTime(a.date) }}</td>
                  <td>{{ a.numero }}</td>
                  <td>{{ a.nom }}</td>
                  <td>{{ a.commentaire }}</td>
                  <td v-if="hasEditPermission">
                    <div class="d-flex justify-content-center">
                      <button
                        type="button"
                        class="btn btn-outline-primary border-0"
                        @click="editAppel(a.id)"
                      >
                        <font-awesome-icon :icon="['far', 'edit']" />
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-danger border-0"
                        @click="supprimerAppel(a.id)"
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- general form elements -->
        <div class="card card-primary card-outline mb-3">
          <!-- /.card-header -->
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Missions</h3>
            <button
              type="button"
              class="btn btn-primary"
              @click="newMission"
              v-if="hasEditPermission"
            >Ajouter une mission</button>
          </div>
          <div class="card-body">
            <table id="int-mission" class="table table-sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Titre</th>
                  <th>Responsable</th>
                  <th>Quittance</th>
                  <th>Résumé</th>
                  <th class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody id="missions">
                <tr v-if="missions.length <= 0">
                  <td colspan="6">Aucune mission</td>
                </tr>
                <tr v-for="m in missions" :key="m.id">
                  <td>{{ formatTime(m.debut) }}</td>
                  <td>{{ m.titre }}</td>
                  <td>{{ formatSapeur(sapeurs.find((s) => s.id == m.sapeur_id)) }}</td>
                  <td>{{ formatTime(m.fin) }}</td>
                  <td>{{ m.resume }}</td>
                  <td>
                    <div class="d-flex justify-content-center">
                      <button
                        type="button"
                        class="btn btn-outline-primary border-0"
                        @click="editMission(m.id)"
                      >
                        <font-awesome-icon :icon="['far', 'edit']" />
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-danger border-0"
                        @click="supprimerMission(m.id)"
                      >
                        <font-awesome-icon :icon="['far', 'trash-alt']" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'InterventionTabJournal',
  computed: {
    ...mapState({
      id: (state) => state.intervention.active.id,
      data: (state) => state.intervention.active.data,
      missions: (state) => state.intervention.active.missions,
      appels: (state) => state.intervention.active.appels,
      sapeurs: (state) => state.sapeur.liste,
      hasEditPermission: (state) => state.auth.sis.permissions.includes(
        permissions.INTERVENTION.MODIFICATION
      ),
    }),
    sortedAppels() {
      return this.appels
        .slice(0)
        .sort((a1, a2) => new Date(a1.date) - new Date(a2.date));
    },
    events() {
      let events = [];
      this.missions.forEach((m) => {
        events.push({
          date: m.debut,
          title: 'Début ' + m.titre,
          description: m.resume,
          type: 'mission',
          colorClass: m.fin ? 'mission-ended' : 'mission-running',
        });

        if (m.fin) {
          events.push({
            date: m.fin,
            title: 'Fin ' + m.titre,
            description: m.resume,
            type: 'mission',
            colorClass: 'mission-ended',
          });
        }

        return events;
      });

      let eventsAppels = this.appels.map((a) => ({
        date: a.date,
        title: a.nom,
        description: a.commentaire,
        type: 'appel',
        colorClass: 'appel',
      }));

      let chefIntervention = this.data.sapeur_id
        ? this.sapeurs.find((s) => s.id == this.data.sapeur_id)
        : null;
      let endDate = this.data.date_fin + ' ' + this.data.heure_fin;
      let startDate = this.data.date_debut + ' ' + this.data.heure_debut;

      let startEvent = {
        date: startDate,
        title: "Debut de l'intervention",
        description: chefIntervention
          ? "Chef d'intervention : " +
          chefIntervention.nom +
          ' ' +
          chefIntervention.prenom
          : '',
        type: 'start',
        colorClass: 'default',
      };

      let duree = Math.abs(new Date(endDate) - new Date(startDate)) / 36e5;
      let endEvent = {
        date: endDate,
        title: "Fin de l'intervention",
        description: 'Durée ' + duree + ' heures',
        type: 'end',
        colorClass: 'default',
      };

      return [
        startEvent,
        ...[...events, ...eventsAppels].sort(
          (e1, e2) => new Date(e1.date) - new Date(e2.date)
        ),
        endEvent,
      ];
    },
  },
  mounted() {
    this.$store.dispatch('fetchInterventionMissions', this.id);
    this.$store.dispatch('fetchInterventionAppels', this.id);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    supprimerAppel(id) {
      this.$store.dispatch('removeAppel', id);
    },
    newAppel() {
      let newAppel = {
        id: null,
        numero: '',
        date: null,
        nom: '',
        commentaire: '',
      };

      let min = this.data.date_debut + ' ' + this.data.heure_debut;
      let max = this.data.date_fin + ' ' + this.data.heure_fin;

      this.SHOW_MODAL({
        component: 'ModalAppel',
        data: { appel: newAppel, min, max },
      });
    },
    editAppel(id) {
      let cloneAppel = {};
      Object.assign(
        cloneAppel,
        this.appels.find((a) => a.id == id)
      );

      let min = this.data.date_debut + ' ' + this.data.heure_debut;
      let max = this.data.date_fin + ' ' + this.data.heure_fin;

      this.SHOW_MODAL({
        component: 'ModalAppel',
        data: { appel: cloneAppel, min, max },
      });
    },

    supprimerMission(id) {
      this.$store.dispatch('removeInterventionMission', id);
    },
    newMission() {
      let newMission = {
        id: null,
        titre: '',
        debut: null,
        fin: null,
        sapeur_id: null,
        resume: '',
      };
      let min = this.data.date_debut + ' ' + this.data.heure_debut;
      let max = this.data.date_fin + ' ' + this.data.heure_fin;

      this.SHOW_MODAL({
        component: 'ModalInterventionMission',
        data: { mission: newMission, min, max },
      });
    },
    editMission(id) {
      let cloneMission = {};
      Object.assign(
        cloneMission,
        this.missions.find((m) => m.id == id)
      );

      let min = this.data.date_debut + ' ' + this.data.heure_debut;
      let max = this.data.date_fin + ' ' + this.data.heure_fin;

      this.SHOW_MODAL({
        component: 'ModalInterventionMission',
        data: {
          mission: cloneMission,
          min,
          max,
        },
      });
    },
    icon(type) {
      const icons = {
        appel: ['fas', 'phone'],
        mission: ['fas', 'child'],
        start: ['fas', 'play'],
        end: ['fas', 'stop'],
      };
      return icons[type];
    },
    formatTime(time) {
      let date = new Date(time);
      return date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2);
    },
    formatSapeur(sapeur) {
      if (!sapeur) return '';
      return sapeur.nom + ' ' + sapeur.prenom;
    },
  },
};
</script>

<style scoped, lang="scss">
.timeline {
  list-style: none;
  padding: 20px 0 0 0;
  position: relative;
  margin-bottom: 0;
  padding-bottom: 0;

  &:before {
    background-color: #eee;
    bottom: 0;
    content: " ";
    left: 50px;
    margin-left: -1.5px;
    position: absolute;
    top: 0;
    width: 3px;
    margin-bottom: 25px;
    margin-top: 25px;
  }

  > li {
    margin-bottom: 20px;
    position: relative;

    &:before,
    &:after {
      content: " ";
      display: table;
    }

    &:after {
      clear: both;
    }

    > .timeline-panel {
      border-radius: 2px;
      border: 1px solid #d4d4d4;
      box-shadow: 0 1px 2px rgba(100, 100, 100, 0.2);
      margin-left: 100px;
      padding: 10px;
      position: relative;

      .timeline-heading {
        .timeline-panel-controls {
          position: absolute;
          right: 8px;
          top: 5px;

          .timestamp {
            display: inline-block;
          }

          .controls {
            display: inline-block;
            padding-right: 5px;
            border-right: 1px solid #aaa;

            a {
              color: #999;
              font-size: 11px;
              padding: 0 5px;

              &:hover {
                color: #333;
                text-decoration: none;
                cursor: pointer;
              }
            }
          }

          .controls + .timestamp {
            padding-left: 5px;
          }
        }
      }
    }

    .timeline-badge {
      background-color: #999;
      border-radius: 50%;
      color: #fff;
      font-size: 1.4em;
      height: 50px;
      left: 50px;
      line-height: 52px;
      margin-left: -25px;
      position: absolute;
      text-align: center;
      top: 6px;
      width: 50px;
      z-index: 100;
    }

    .timeline-badge + .timeline-panel {
      &:before {
        border-bottom: 15px solid transparent;
        border-left: 0 solid #ccc;
        border-right: 15px solid #ccc;
        border-top: 15px solid transparent;
        content: " ";
        display: inline-block;
        position: absolute;
        left: -15px;
        right: auto;
        top: 16px;
      }

      &:after {
        border-bottom: 14px solid transparent;
        border-left: 0 solid #fff;
        border-right: 14px solid #fff;
        border-top: 14px solid transparent;
        content: " ";
        display: inline-block;
        position: absolute;
        left: -14px;
        right: auto;
        top: 17px;
      }
    }
  }
}

.timeline-badge {
  &.mission-ended {
    background-color: var(--success) !important;
    opacity: 0.8;
  }

  &.mission-running {
    background-color: var(--warning) !important;
    opacity: 0.8;
  }

  &.appel {
    // FIXME: Be sure to import css variables
    background-color: var(--primary) !important;
    opacity: 0.8;
  }
}

.timeline-title {
  margin-top: 0;
  color: inherit;
}

.timeline-body {
  > p,
  > ul {
    margin-bottom: 0;
  }

  > p + p {
    margin-top: 5px;
  }
}

.copy {
  position: absolute;
  top: 5px;
  right: 5px;
  color: #aaa;
  font-size: 11px;
  > * {
    color: #444;
  }
}
</style>
