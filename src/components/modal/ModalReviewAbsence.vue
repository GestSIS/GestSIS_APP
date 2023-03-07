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
          <!-- <div class="row">
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
          </div> -->

          <div class="mb-3">
            <label for="justification"
              >Justification <em>(optionnel)</em></label
            >
            <textarea
              id="justification"
              ref="justification"
              v-model="activeAbsence.justification"
              class="form-control form-control-sm"
              placeholder="(optionnel)"
            ></textarea>
          </div>
          <div
            class="btn-group btn-group-sm mb-3"
            role="group"
            aria-label="Small button group"
          >
            <button
              type="button"
              class="btn"
              :class="
                'btn-' +
                (computedButtonState == -2 ? '' : 'outline-') +
                'danger'
              "
              @click="review(-2)"
            >
              Amendé
            </button>
            <button
              type="button"
              class="btn"
              :class="
                'btn-' +
                (computedButtonState == -1 ? '' : 'outline-') +
                'warning'
              "
              @click="review(-1)"
            >
              Refusé
            </button>
            <button
              type="button"
              class="btn"
              :class="
                'btn-' +
                (computedButtonState == 0 ? '' : 'outline-') +
                'primary'
              "
              @click="review(0)"
            >
              A traiter
            </button>
            <button
              type="button"
              class="btn"
              :class="
                'btn-' +
                (computedButtonState == 1 ? '' : 'outline-') +
                'success'
              "
              @click="review(1)"
            >
              Accepté
            </button>
          </div>
        </div>
        <div class="col-9">
          <div v-if="loading" class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          <base-table
            v-show="!loading"
            ref="table"
            :fields="fields"
            :data="computedSapeurExercices"
            :selectable="false"
            :row-class="rowClass"
            no-data="Aucun exercice pour ce sapeur"
          >
            <template #excuse="{ rowData }">
              <div class="text-center">
                <span
                  v-if="
                    rowData.excuse_type_id && rowData.excuse_type_id !== true
                  "
                  class="badge rounded-pill text-bg-primary"
                  :class="{
                    'text-bg-danger': rowData.excuse_statut == -1,
                    'text-bg-secondary': rowData.excuse_statut == 0,
                    'text-bg-success': rowData.excuse_statut == 1,
                  }"
                  >{{
                    excuseTypes.find((e) => e.id == rowData?.excuse_type_id)
                      ?.designation
                  }}</span
                >
                <button
                  v-if="rowData.justificatif_filename != ''"
                  class="btn"
                  @click="downloadJustificatif(rowData)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
              </div>
            </template>
          </base-table>
          <!-- :detail-row-component="detailRowComponent" -->
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-outline-primary"
        :disabled="
          !computedAbsences || computedAbsences[0]?.id == activeAbsence?.id
        "
        @click="previousAbsence()"
      >
        Précédent
      </button>
      <button
        type="button"
        class="btn btn-outline-primary"
        :disabled="
          !computedAbsences ||
          computedAbsences[computedAbsences.length - 1]?.id == activeAbsence?.id
        "
        @click="nextAbsence()"
      >
        Suivant
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="HIDE_MODAL()"
      >
        Fermer
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import ExerciceService from '../../services/ExerciceService';
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
      loading: true,
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
        { title: 'Excuse', slot: 'excuse', key: 'excuse_type_id' },
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
    computedAbsences() {
      return this.absences
        .map((a) => ({
          ...a,
          nom_prenom: this.sapeurs.find((s) => s.id == a.sapeur_id)?.nom_prenom,
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
    computedButtonState() {
      return this.activeAbsence.amende && this.activeAbsence.excuseStatut != 0
        ? -2
        : this.activeAbsence.excuseStatut;
    },
  },
  mounted() {
    if (this.data?.id) {
      this.activeAbsence = this.computedAbsences.find(
        (a) => a.id == this.data.id
      );
    } else if (!this.computedAbsences.length) {
      this.HIDE_MODAL();
      this.$awn.warning('Attention, aucune absence à traiter');
    } else {
      this.activeAbsence = this.computedAbsences[0];
    }
    this.loadSapeurExercices();
  },
  methods: {
    ...mapMutations(['HIDE_MODAL', 'UPDATE_MODAL_SIZE']),
    async review(state) {
      this.activeAbsence.amende = state == -2;
      this.activeAbsence.excuseStatut = state == -2 ? -1 : state;
      return this.$store
        .dispatch('editPresenceExercice', {
          presenceId: this.activeAbsence?.id,
          presence: this.activeAbsence,
        })
        .then(
          (res) =>
            this.$awn.success(res?.message || 'Modifications enregistrées')
          // TODO: Update locale stored presences
        )
        .catch((err) =>
          this.$awn.alert(err?.message || "Erreur lors de l'enregistrement")
        );
    },
    nextAbsence() {
      // Switch to next absence
      const activeIndex = this.computedAbsences.findIndex(
        (a) => a.id == this.activeAbsence?.id
      );
      const previousSapeurId = this.activeAbsence.sapeur_id;
      console.log(activeIndex);
      if (this.computedAbsences.length - 1 > activeIndex) {
        this.activeAbsence = { ...this.computedAbsences[activeIndex + 1] };
      } else {
        // TODO: Loop sur les excuses non-traitées ??
      }

      if (previousSapeurId != this.activeAbsence.sapeur_id) {
        this.loadSapeurExercices();
      }
    },
    previousAbsence() {
      // Switch to next absence
      const activeIndex = this.computedAbsences.findIndex(
        (a) => a.id == this.activeAbsence?.id
      );
      const previousSapeurId = this.activeAbsence.sapeur_id;
      console.log(activeIndex);
      if (activeIndex > 0) {
        this.activeAbsence = { ...this.computedAbsences[activeIndex - 1] };
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
      this.loading = true;
      return SapeurService.getExercices(
        this.activeAbsence.sapeur_id,
        this.activeExerciceComptableId
      )
        .then((data) => {
          this.activeSapeurExercices = data;
          this.loading = false;
        })
        .catch(() => {
          this.$awn.alert(
            'Une erreur a eu lieu durant la récupération des exercices du sapeur'
          );
        });
    },
    downloadJustificatif(exercice) {
      ExerciceService.downloadMonExcuseJustificatif(
        exercice.exercice_id,
        'justificatif.pdf'
      ).catch((err) =>
        this.$awn.alert(
          err?.message ?? 'Erreur lors du chargement du justificatif'
        )
      );
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
