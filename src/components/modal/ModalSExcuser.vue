<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">S'excuser</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="activeExcuse.exercice_id"
        class="mb-3"
        :class="{
          'is-invalid': errors['excuse_type_id'],
        }"
        :options="excuses"
        :formatter="
          (e) =>
            new Date(e.date).toLocaleDateString('fr-CH').slice(0, 10) +
            ' - ' +
            e.categorie +
            ' (' +
            e.designation +
            ')'
        "
        value-key="exercice_id"
        label="Exercice"
      />
      <template v-if="!activeExcuse.exercice_id">
        <p class="text-warning">Sélectionnez un exercice</p>
      </template>
      <template v-else-if="estAnnule(activeExercice)">
        <p class="text-warning">Exercice annulé</p>
      </template>
      <template v-else-if="estDejaExcuse(activeExercice)">
        <p class="text-success">Excuse déjà saisie</p>
      </template>
      <template v-else-if="!estDansLeDelai(activeExercice?.date)">
        <p class="text-warning">
          Délai d'excuse ({{ excuseParams.delai_excuse }}
          jours) dépassé pour cet exercice !
        </p>
      </template>
      <template v-else>
        <base-select
          v-model="activeExcuse.excuse_type_id"
          class="mb-3"
          :class="{ 'is-invalid': errors['excuse_type_id'] }"
          :options="excuseTypes"
          label="Excuse type"
        />
        <div class="mb-3">
          <label for="remarque">Raison</label>
          <input
            id="remarque"
            v-model="activeExcuse.remarque"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['remarque'] }"
          />
        </div>
        <div class="mb-3">
          <label>Justificatif</label>
          <input
            ref="file-justificatif"
            type="file"
            class="form-control form-control-sm"
            accept="application/pdf"
            @change="onFileChange"
          />
        </div>
      </template>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-primary" @click="validate">Valider</button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '/src/store/permissions.js';

export default {
  name: 'ModalSExcuser',
  props: {
    callback: {
      type: Function,
      default: () => {},
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      excuses: [],
      activeExcuse: {
        remarque: '',
        exercice_id: 0,
        excuse_type_id: null,
        excuse_statut: 0,
        justification: '',
        justificatif_file: null,
      },
    };
  },
  computed: {
    ...mapState({
      excuseParams: (state) => state.excuseParam.params,
      excuseTypes: (state) =>
        state.excuseType.liste.filter((e) => e.statut == 1),
      hasValidationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.VALIDATION),
    }),
    activeExercice() {
      return this.excuses.find(
        (e) => e.exercice_id === this.activeExcuse.exercice_id
      );
    },
  },
  mounted() {
    const excuse = this.data.exercices.find(
      (e) => e.exercice_id === this.data.exerciceId
    );
    this.excuses = this.data.exercices;
    this.activeExcuse = {
      ...this.activeExcuse,
      remarque: excuse?.remarque ?? '',
      exercice_id: excuse?.exercice_id ?? 0,
      justification: excuse?.justification ?? 0,
      excuse_type_id: excuse?.excuse_type_id ?? 0,
      justificatif_file: null,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    estDansLeDelai(date) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      var delay = new Date(date);
      delay.setDate(delay.getDate() + this.excuseParams.delai_excuse);
      return now <= delay;
    },
    estDejaExcuse(exercice) {
      return !!exercice.excuse_type_id;
    },
    estAnnule(exercice) {
      return exercice.statut === 0;
    },
    onFileChange(event) {
      const files = event.target.files || event.dataTransfer.files;
      if (!files.length) return;
      this.activeExcuse.justificatif_file = files[0];
    },
    validate() {
      if (
        !this.activeExcuse.exercice_id ||
        this.estAnnule(this.activeExercice) ||
        this.estDejaExcuse(this.activeExercice) ||
        !this.estDansLeDelai(this.activeExercice?.date)
      ) {
        this.HIDE_MODAL();
        this.$awn.warning('Excuse non-enregistrée');
        return;
      }
      this.$store
        .dispatch('addMonExcuse', this.activeExcuse)
        .then(() => {
          this.$awn.success('Excuse enregistrée');
          this.HIDE_MODAL();
        })
        .catch((err) => {
          this.$awn.alert(
            err?.message ?? "Erreur lors de la création de l'excuse"
          );
        });
    },
    close() {
      this.HIDE_MODAL();
      this.$awn.warning('Excuse non enregistrée');
    },
  },
};
</script>

<style scoped></style>
