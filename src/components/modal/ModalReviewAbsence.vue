<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Revue absence</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-3">
          <base-select
            :model-value="activeExercice?.exercice_categorie_id"
            class="mb-3"
            :options="categories"
            label="Catégorie"
            disabled
          />
          <div class="mb-3">
            <label for="designation">Désignation</label>
            <input
              id="designation"
              :value="activeExercice?.designation"
              type="text"
              class="form-control form-control-sm"
              disabled
            />
          </div>
          <div class="row">
            <div class="col-6">
              <div class="mb-3">
                <label for="date">Date</label>
                <input
                  id="date"
                  :value="activeExercice?.date"
                  type="date"
                  class="form-control form-control-sm"
                  disabled
                />
              </div>
            </div>
            <div class="col-6">
              <base-select
                v-model="activeAbsence.sapeur_id"
                class="mb-3"
                label="Sapeur"
                display-key="nom_prenom"
                :options="sapeurs"
                disabled
              />
            </div>
          </div>
          <div class="row">
            <div class="col-6">
              <base-select
                v-model="activeAbsence.auteur_id"
                class="mb-3"
                label="Saisie par"
                display-key="nom_prenom"
                :options="sapeurs"
                disabled
              />
            </div>
            <div class="col-6">
              <div class="mb-3">
                <label for="date">Le</label>
                <input
                  id="date"
                  v-model="activeAbsence.date_demande"
                  type="date"
                  class="form-control form-control-sm"
                  disabled
                />
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label for="justification">Justification</label>
            <textarea
              id="justification"
              ref="justification"
              v-model="activeAbsence.justification"
              class="form-control form-control-sm"
              placeholder="(optionnel)"
            ></textarea>
          </div>

          <div class="row">
            <div class="col-6">
              <button class="btn btn-primary col-12" @click="review(true)">
                Accepter
              </button>
            </div>
            <div class="col-6">
              <button class="btn btn-danger col-12" @click="review(false)">
                Refuser
              </button>
            </div>
          </div>
        </div>
        <div class="col-9">
          <base-table
            ref="table"
            :fields="fields"
            :data="computedSapeurExercices"
            :selectable="false"
            :row-class="rowClass"
            no-data="Aucun exercice pour ce sapeur"
          />
          <!-- :detail-row-component="detailRowComponent" -->
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="HIDE_MODAL()"
      >
        Annuler
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import SapeurService from '../../services/SapeurService';

export default {
  name: 'ModalReviewAbsence',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      columnCreationIndex: 0,
      columns: [],
      base: [],
      activeAbsence: {
        exercice_comptable_id: null,
        sapeurs: [{ sapeur_id: null, quantite: null }],
      },
      activeSapeurExercices: [],
      fields: [
        { title: 'Date', key: 'date', type: Date },
        { title: 'Categorie', key: 'categorie' },
        { title: 'Exercice', key: 'designation' },
        { title: 'Localité', key: 'localite' },
        { title: 'Convoqué', type: Boolean, key: 'convoque' },
        { title: 'Présent', type: Boolean, key: 'present' },
        { title: 'Absent', type: Boolean, key: 'absent' },
        { title: 'Remplacé', type: Boolean, key: 'remplace' },
        { title: 'Excuse', type: Boolean, key: 'excuse_type_id' },
        { title: 'Amende', type: Boolean, key: 'amende' },
      ],
    };
  },
  computed: {
    ...mapState({
      excuseParam: (state) => state.excuseParam.params,
      absences: (state) => state.exercice.absences,
      exercices: (state) => state.exercice.liste,
      categories: (state) => state.exerciceCategorie.liste,
      sapeurs: (state) => state.sapeur.liste.filter((s) => s.actif),
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      activeSapeurId: (state) => state.auth.sapeurId,
      excuseTypes: (state) => state.excuseType.liste,
      localites: (state) => state.localite.liste,
    }),
    computedSapeurExercices() {
      return this.activeSapeurExercices
        ?.map((e) => ({
          ...e.presence,
          ...e,
          excuse: this.excuseTypes.find((t) => t.id == e.excuse_type_id)
            ?.designation,
          localite: this.localites.find((l) => l.id == e.localite_id)
            ?.designation,
          categorie: this.categories.find(
            (c) => c.id == e.exercice_categorie_id
          )?.designation,
        }))
        ?.sort((e1, e2) => e1.date?.localeCompare(e2.date));
    },
    activeExercice() {
      return this.exercices.find(
        (e) => e.id == this.activeAbsence?.exercice_id
      );
    },
    computedAbsence() {
      return this.absences
        .map((a) => ({
          ...a,
          sapeur: this.sapeurs.find((s) => s.id == a.sapeur_id)?.nom_prenom,
          exercice_date: this.exercices.find((e) => e.id == a.exercice_id)
            ?.date,
        }))
        .sort(
          (a, b) =>
            a?.nom_prenom?.localeCompare(b?.nom_prenom) ||
            a?.exercice_date?.localeCompare(b?.exercice_date)
        );
    },
    activeSapeurExcuses() {
      return null;
    },
  },
  mounted() {
    if (this.data?.id) {
      this.activeAbsence = this.computedAbsence.find(
        (a) => a.id == this.data.id
      );
    } else if (!this.computedAbsence.length) {
      this.HIDE_MODAL();
      this.$awn.warning('Attention, aucune absence à traiter');
    } else {
      this.activeAbsence = this.computedAbsence[0];
    }
    this.loadSapeurExercices();
  },
  methods: {
    ...mapMutations(['HIDE_MODAL', 'UPDATE_MODAL_SIZE']),
    async review(accepte) {
      this.$store
        .dispatch('reviewTravail', { ...this.activeAbsence, accepte })
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch(
          (errors) =>
            (this.errors = {
              ...errors,
            })
        );
    },
    nextAbsence() {
      // Switch to next absence
      const activeIndex = this.absences.findIndex(
        (a) => a.id == this.activeAbsence?.id
      );
      const previousSapeurId = this.activeAbsence.sapeur_id;

      if (this.absences.length - 1 < activeIndex) {
        this.activeAbsence = this.absences[activeIndex + 1];
      } else {
        // TODO: Loop sur les excuses non-traitées ??
      }

      if (previousSapeurId != this.activeAbsence.sapeur_id) {
        this.loadSapeurExercices();
      }
    },
    loadSapeurExercices() {
      // Load sapeurs exercices
      // FIXME: Check permissions pour cette route
      return SapeurService.getExercices(
        this.activeAbsence.sapeur_id,
        this.activeExerciceComptableId
      )
        .then((data) => {
          this.activeSapeurExercices = data;
        })
        .catch(() => {
          this.$awn.alert(
            'Une erreur a eu lieu durant la récupération des exercices du sapeur'
          );
        });
    },
    rowClass(rowData) {
      return rowData.id == this.activeAbsence.exercice_id
        ? 'table-primary'
        : '';
    },
  },
};
</script>

<style scoped></style>
