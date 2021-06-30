<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title" id="exampleModalLabel">Ajouter une promotion</h5>
      <button type="button" class="close" @click="HIDE_MODAL()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label for="debut">Début de la phase</label>
        <datetime
          v-model="activePhase.debut2"
          :format="format"
          type="datetime"
          :input-class="{ 'form-control': true, 'is-invalid': errors['debut'] }"
          id="debut"
          :min-datetime="min"
          :max-datetime="max"
          :minute-step="15"
          :disabled="activePhase.debut === null && activePhase.id"
        ></datetime>
        <!--        <input-->
        <!--          type="date"-->
        <!--          v-model="activePhase.debut"-->
        <!--          class="form-control"-->
        <!--          :class="{ 'is-invalid': errors['debut'] }"-->
        <!--          id="cours-date"-->
        <!--        />-->
      </div>
      <div class="form-group">
        <label for="phase_type">Type</label>
        <select
          id="phase_type"
          v-model="activePhase.phase_type_id"
          class="custom-select"
          :class="{ 'is-invalid': errors['phase_type_id'] }"
        >
          <option v-for="p in listePhaseType" :key="p.id" :value="p.id">
            {{ p.designation }}
          </option>
        </select>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activePhase.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { DateTime } from 'luxon';

export default {
  name: 'ModalPhase',
  data() {
    return {
      errors: {},
      format: 'yyyy-MM-dd HH:mm',
      min: null,
      max: null,
    };
  },
  props: {
    data: {
      type: Object,
    },
  },
  computed: {
    ...mapState({
      activeSapeurId: (state) => state.sapeur.active.id,
      listePhaseType: (state) => state.phaseType.liste,
      activePhase: (state) => state.phaseType.active.data,
    }),
  },
  mounted() {
    this.min = DateTime.fromSQL(this.data.min).toISO();
    this.max = DateTime.fromSQL(this.data.max).toISO();

    if (this.activePhase.debut === null && this.activePhase.id) {
      this.activePhase.debut2 = this.min;
    } else {
      this.activePhase.debut2 = DateTime.fromSQL(
        this.activePhase.debut
      ).toISO();
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    save() {
      if (!(this.activePhase.debut === null && this.activePhase.id)) {
        this.activePhase.debut = DateTime.fromISO(
          this.activePhase.debut2
        ).toFormat(this.format);
      }
      if ((this.activePhase.id || 0) === 0) {
        this.$store
          .dispatch('addPhase', {
            ...this.activePhase,
            debut2: undefined,
          })
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      } else {
        this.$store
          .dispatch('editPhase', {
            ...this.activePhase,
            debut2: undefined,
          })
          .then(() => {
            this.errors = {};
            this.HIDE_MODAL();
          })
          .catch((errors) => (this.errors = errors));
      }
    },
  },
};
</script>

<style scoped></style>
