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
            <div class="timeline-panel" @click="e.action(e.id)">
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
                <p v-if="e.responsable">{{ e.responsable }}</p>
                <p v-if="e.description">{{ e.description }}</p>
              </div>
            </div>
          </li>
        </ul>
      </div>
      <div class="col-sm-12 col-md-8 col-xl-8">
        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Appels</h3>
            <button
              v-if="hasEditPermission"
              type="button"
              class="btn btn-primary"
              @click="newAppel"
            >
              Ajouter un appel
            </button>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :data="appels"
              :fields="fieldsAppels"
              :selectable="true"
              no-data="Aucune appel"
            >
              <template #actions="{ rowData }">
                <div class="d-flex justify-content-center">
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="editAppel(rowData.id)"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="supprimerAppel(rowData.id)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </div>
              </template>
            </base-table>
          </div>
        </div>

        <div class="card card-primary card-outline mb-3">
          <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">Missions</h3>
            <button
              v-if="hasEditPermission"
              type="button"
              class="btn btn-primary"
              @click="newMission"
            >
              Ajouter une mission
            </button>
          </div>
          <div class="card-body table-responsive p-0">
            <base-table
              :data="missions"
              :fields="fieldsMissions"
              :selectable="true"
              no-data="Aucune mission"
            >
              <template #actions="{ rowData }">
                <div class="d-flex justify-content-center">
                  <button
                    type="button"
                    class="btn btn-outline-primary border-0"
                    @click="editMission(rowData.id)"
                  >
                    <font-awesome-icon :icon="['far', 'edit']" />
                  </button>
                  <button
                    type="button"
                    class="btn btn-outline-danger border-0"
                    @click="supprimerMission(rowData.id)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </div>
              </template>
            </base-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'InterventionTabJournal',
  data() {
    return {
      fieldsMissions: [
        { title: 'Date', type: 'time', key: 'fin' },
        { title: 'Titre', key: 'titre' },
        { title: 'Sapeur', key: 'sapeur' },
        { title: 'Quittance', type: 'time', key: 'fin' },
        { title: 'Résumé', key: 'resume' },
        { title: 'Actions', slot: 'actions' },
      ],
      fieldsAppels: [
        { title: 'Date', type: 'time', key: 'date' },
        { title: 'Numéro', key: 'numero' },
        { title: 'Nom', key: 'nom' },
        { title: 'Commentaire', key: 'commentaire' },
        { title: 'Actions', slot: 'actions' },
      ],
    };
  },
  computed: {
    ...mapState({
      id: (state) => state.intervention.active.id,
      data: (state) => state.intervention.active.data,
      sapeurs: (state) => state.sapeur.liste,
      missions: (state) =>
        state.intervention.active.missions.map((m) => ({
          ...m,
          sapeur:
            m.sapeur ||
            state.sapeur.liste.find((s) => s.id == m.sapeur_id)?.nom_prenom,
        })),
      appels: (state) => state.intervention.active.appels,
      // TODO: Check si intervention pas déjà imputé
      hasEditPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.INTERVENTION.MODIFICATION
        ),
    }),
    sortedAppels() {
      return this.appels
        .slice(0)
        .sort((a1, a2) => new Date(a1.date) - new Date(a2.date));
    },
    events() {
      const events = [];
      const missionAction = this.hasEditPermission
        ? this.editMission
        : () => {};
      const appelAction = this.hasEditPermission ? this.editAppel : () => {};
      this.missions.forEach((m) => {
        events.push({
          id: m.id,
          date: m.debut,
          title: 'Début ' + m.titre,
          description: m.resume,
          responsable: m.sapeur,
          type: 'mission',
          colorClass: m.fin ? 'mission-ended' : 'mission-running',
          action: missionAction,
        });

        if (m.fin) {
          events.push({
            id: m.id,
            date: m.fin,
            title: 'Fin ' + m.titre,
            description: m.resume,
            type: 'mission',
            colorClass: 'mission-ended',
            action: missionAction,
          });
        }

        return events;
      });

      const eventsAppels = this.appels.map((a) => ({
        id: a.id,
        date: a.date,
        title: a.nom,
        description: a.commentaire,
        type: 'appel',
        colorClass: 'appel',
        action: appelAction,
      }));

      const chefIntervention = this.data.sapeur_id
        ? this.sapeurs.find((s) => s.id == this.data.sapeur_id)
        : null;
      const endDate = this.data.date_fin + ' ' + this.data.heure_fin;
      const startDate = this.data.date_debut + ' ' + this.data.heure_debut;

      const startEvent = {
        date: startDate,
        title: "Debut de l'intervention",
        description: chefIntervention
          ? "Chef d'intervention : " + chefIntervention?.nom_prenom
          : '',
        type: 'start',
        colorClass: 'default',
        action: () => {},
      };

      const duree = Math.abs(new Date(endDate) - new Date(startDate)) / 6e4;
      const heures = Math.floor(duree / 60);
      const minutes = Math.floor(duree % 60);
      let dureeFormatee = '';
      if (heures && minutes) {
        dureeFormatee = heures + 'h' + minutes;
      } else if (heures) {
        dureeFormatee = heures + ' heure' + (heures > 1 ? 's' : '');
      } else {
        dureeFormatee = minutes + ' minute' + (minutes > 1 ? 's' : '');
      }
      const endEvent = {
        date: endDate,
        title: "Fin de l'intervention",
        description: 'Durée : ' + dureeFormatee,
        type: 'end',
        colorClass: 'default',
        action: () => {},
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
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cet appel ?',
          question:
            "Attention, la suppression d'un appel est irréversible ! Toutes les données de cet appel seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeInterventionAppel', id);
          }
        },
      });
    },
    newAppel() {
      const newAppel = {
        id: null,
        numero: '',
        date: null,
        nom: '',
        commentaire: '',
      };

      const min = this.data.date_debut + ' ' + this.data.heure_debut;
      const max = this.data.date_fin + ' ' + this.data.heure_fin;

      this.SHOW_MODAL({
        component: 'ModalAppel',
        data: { appel: newAppel, min, max },
      });
    },
    editAppel(id) {
      const cloneAppel = {};
      Object.assign(
        cloneAppel,
        this.appels.find((a) => a.id == id)
      );

      const min = this.data.date_debut + ' ' + this.data.heure_debut;
      const max = this.data.date_fin + ' ' + this.data.heure_fin;

      this.SHOW_MODAL({
        component: 'ModalAppel',
        data: { appel: cloneAppel, min, max },
      });
    },

    supprimerMission(id) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette mission ?',
          question:
            "Attention, la suppression d'un mission est irréversible ! Toutes les données de cette mission seront perdues !",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeInterventionMission', id);
          }
        },
      });
    },
    newMission() {
      const newMission = {
        id: null,
        titre: '',
        debut: null,
        fin: null,
        sapeur_id: null,
        resume: '',
      };
      const min = this.data.date_debut + ' ' + this.data.heure_debut;
      const max = this.data.date_fin + ' ' + this.data.heure_fin;

      this.SHOW_MODAL({
        component: 'ModalInterventionMission',
        data: { mission: newMission, min, max },
      });
    },
    editMission(id) {
      const cloneMission = {};
      Object.assign(
        cloneMission,
        this.missions.find((m) => m.id == id)
      );

      const min = this.data.date_debut + ' ' + this.data.heure_debut;
      const max = this.data.date_fin + ' ' + this.data.heure_fin;

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
      const date = new Date(time);
      return date.getHours() + ':' + ('0' + date.getMinutes()).slice(-2);
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
    content: ' ';
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
      content: ' ';
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
        content: ' ';
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
        content: ' ';
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
    background-color: var(--bs-success) !important;
    opacity: 0.8;
  }

  &.mission-running {
    background-color: var(--bs-warning) !important;
    opacity: 0.8;
  }

  &.appel {
    background-color: var(--bs-primary) !important;
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
