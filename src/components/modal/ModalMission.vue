<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter une mission</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="debut">Début</label>
        <datetime
          v-model="activeMission.debut2"
          :format="format"
          type="datetime"
          :input-class="{ 'form-control': true, 'is-invalid': errors['debut'] }"
          id="debut"
          :min-datetime="min"
          :max-datetime="max"
        ></datetime>
        <!--        <input-->
        <!--          type="datetime-local"-->
        <!--          v-model="activeMission.debut"-->
        <!--          class="form-control"-->
        <!--          :class="{ 'is-invalid': errors['debut'] }"-->
        <!--          id="debut"-->
        <!--        />-->
      </div>
      <div class="form-group">
        <autocomplete
          v-model="activeMission.titre"
          :items="listMissions.map(m => m.titre)"
          :error="!!errors['titre']"
          title="Titre"
        />
      </div>
      <div class="form-group">
        <label for="mission">Responsable</label>
        <select
          id="mission"
          v-model="activeMission.sapeur_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['sapeur_id'] }"
        >
          <option v-for="s in listSapeurs" :key="s.id" :value="s.id">{{
            s | sapeur
          }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="fin">Quittance</label>
        <datetime
          v-model="activeMission.fin2"
          :format="format"
          type="datetime"
          :input-class="{ 'form-control': true, 'is-invalid': errors['fin'] }"
          id="fin"
          :min-datetime="activeMission.debut2 || min"
          :max-datetime="max"
        ></datetime>
        <!--        <input-->
        <!--          type="datetime-local"-->
        <!--          v-model="activeMission.fin2"-->
        <!--          class="form-control"-->
        <!--          :class="{ 'is-invalid': errors['fin'] }"-->
        <!--          id="fin"-->
        <!--        />-->
      </div>
      <div class="form-group">
        <label for="resume">Résumé</label>
        <textarea
          v-model="activeMission.resume"
          class="form-control"
          :class="{ 'is-invalid': errors['resume'] }"
          id="resume"
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
import { mapState, mapMutations } from 'vuex'
import { DateTime } from 'luxon'

import Autocomplete from '@/components/Autocomplete'

export default {
  name: 'ModalMission',
  components: {
    Autocomplete
  },
  props: {
    data: {
      type: Object
    }
  },
  data() {
    return {
      errors: {},
      activeMission: {},
      format: 'yyyy-MM-dd HH:mm',
      min: null,
      max: null
    }
  },
  computed: {
    ...mapState({
      listMissions: state => state.mission.liste,
      listSapeurs: state => state.sapeur.liste.filter(s => s.actif),
      activeInterventionId: state => state.intervention.active.id
    })
  },
  mounted() {
    if (this.listMissions.length === 0) {
      this.$store.dispatch('fetchMissions')
    }
    this.activeMission = this.data.mission

    this.min = DateTime.fromSQL(this.data.min).toISO()
    this.max = DateTime.fromSQL(this.data.max).toISO()

    this.activeMission.debut2 = DateTime.fromSQL(
      this.activeMission.debut
    ).toISO()
    this.activeMission.fin2 = DateTime.fromSQL(this.activeMission.fin).toISO()
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      //Format back dates to SQL Format
      this.activeMission.debut = DateTime.fromISO(
        this.activeMission.debut2
      ).toFormat(this.format)
      this.activeMission.fin = DateTime.fromISO(
        this.activeMission.fin2
      ).toFormat(this.format)

      if ((this.activeMission.id || 0) === 0) {
        this.$store
          .dispatch('addMission', this.activeMission)
          .then(() => {
            this.errors = {}
            this.HIDE_MODAL()
          })
          .catch(errors => (this.errors = errors))
      } else {
        this.$store
          .dispatch('editMission', this.activeMission)
          .then(() => {
            this.errors = {}
            this.HIDE_MODAL()
          })
          .catch(errors => (this.errors = errors))
      }
    }
  }
}
</script>

<style scoped></style>
