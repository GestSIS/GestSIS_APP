<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Ajouter une mission</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="debut">Début</label>
        <input
          id="debut"
          v-model="activeMission.debut2"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['debut'] }"
        />
        <!-- :min="min"
        :max="max"-->
      </div>
      <div class="mb-3">
        <base-autocomplete
          v-model="activeMission.titre"
          :items="listMissions.map((m) => m.titre)"
          :error="!!errors['titre']"
          title="Titre"
        />
      </div>
      <base-select
        v-model="activeMission.sapeur_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['sapeur_id'] }"
        label="Responsable"
        display-key="nom_prenom"
        :options="listeSapeurs"
      />
      <div class="mb-3">
        <label for="fin">Quittance</label>
        <input
          id="fin"
          v-model="activeMission.fin2"
          type="datetime-local"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['fin'] }"
        />
        <!-- :min="activeMission.debut2 || min"
        :max="max"-->
      </div>
      <div class="mb-3">
        <label for="resume">Résumé</label>
        <textarea
          id="resume"
          v-model="activeMission.resume"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['resume'] }"
        ></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeMission.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { DateTime } from 'luxon';

import BaseAutocomplete from '/src/components/base/BaseAutocomplete.vue';

export default {
  name: 'ModalInterventionMission',
  components: {
    BaseAutocomplete,
  },
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      activeMission: {},
      format: 'yyyy-MM-dd HH:mm',
      // min: null,
      // max: null,
    };
  },
  computed: {
    ...mapState({
      listMissions: (state) => state.mission.liste,
      listeSapeurs: (state) => state.sapeur.liste.filter((s) => s.actif),
      activeInterventionId: (state) => state.intervention.active.id,
    }),
  },
  mounted() {
    if (this.listMissions.length === 0) {
      this.$store.dispatch('fetchMissions');
    }
    this.activeMission = this.data.mission;
    // this.min = this.data.min;//DateTime.fromSQL(this.data.min)slice(0, ).toISO().slice(0, 16);
    // this.max = this.data.max;//DateTime.fromSQL(this.data.max).toISO().slice(0, 16);

    this.activeMission.debut2 = this.activeMission.debut?.replace(' ', 'T');
    this.activeMission.fin2 = this.activeMission.fin?.replace(' ', 'T');
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      //Format back dates to SQL Format
      this.activeMission.debut = DateTime.fromISO(
        this.activeMission.debut2
      )?.toFormat(this.format);
      this.activeMission.fin = DateTime.fromISO(
        this.activeMission.fin2
      )?.toFormat(this.format);

      if ((this.activeMission.id || 0) === 0) {
        this.$store
          .dispatch('addInterventionMission', this.activeMission)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
              (this.errors = {
                ...errors,
                debut: errors['missions.0.debut'],
                fin: errors['missions.0.fin'],
                sapeur_id: errors['missions.0.sapeur_id'],
                titre: errors['missions.0.titre'],
              })
          );
      } else {
        this.$store
          .dispatch('editInterventionMission', this.activeMission)
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch(
            (errors) =>
              (this.errors = {
                ...errors,
                debut: errors['missions.0.debut'],
                fin: errors['missions.0.fin'],
                sapeur_id: errors['missions.0.sapeur_id'],
                titre: errors['missions.0.titre'],
              })
          );
      }
    },
  },
};
</script>

<style scoped></style>
