<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Revue du travail</h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="activeTravail.travail_type_id"
        class="mb-3"
        :options="travailTypes"
        label="Travail"
        disabled
      />
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeTravail.designation"
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
              v-model="activeTravail.date"
              type="date"
              class="form-control form-control-sm"
              disabled
            />
          </div>
        </div>
        <div class="col-6">
          <base-select
            v-model="activeTravail.sapeur_id"
            class="mb-3"
            label="Sapeur"
            display-key="nom_prenom"
            :options="sapeurs"
            disabled
          />
        </div>
      </div>
      <label for="quantite">Quantité</label>
      <div class="input-group input-group-sm mb-3">
        <input
          id="quantite"
          v-model="activeTravail.quantite"
          name="quantite"
          type="number"
          min="0"
          class="form-control form-control-sm"
        />
        <span class="input-group-text">
          {{
            unites.find(
              (u) =>
                u.id ==
                travailTypes.find((t) => t.id == activeTravail.travail_type_id)
                  ?.type_unite_id,
            )?.unite
          }}</span
        >
      </div>
      <div class="row">
        <div class="col-6">
          <base-select
            v-model="activeTravail.auteur_id"
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
              v-model="activeTravail.date_demande"
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
          v-model="activeTravail.justification"
          class="form-control form-control-sm"
          placeholder="(optionnel)"
          :required="initialQuantite != activeTravail.quantite"
        ></textarea>
        <label
          v-if="initialQuantite != activeTravail.quantite"
          class="text-danger"
          ><em
            >Quantité modifiée, justifiez ce changement pour plus de
            transparence</em
          ></label
        >
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
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

import permissions from '../../store/permissions.js';

export default {
  name: 'ModalReviewTravail',
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
      activeTravail: {
        exercice_comptable_id: null,
        sapeurs: [{ sapeur_id: null, quantite: null }],
      },
      initialQuantite: null,
    };
  },
  computed: {
    ...mapState({
      unites: (state) => state.unite.liste,
      travailTypes: (state) => state.travailType.liste,
      sapeurs: (state) => state.sapeur.liste.filter((s) => s.actif),
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
      activeSapeurId: (state) => state.auth.sapeurId,
      hasSaisieCommunePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(
          permissions.FICHE_TRAVAIL.SAISIE_COMMUNE,
        ),
    }),
  },
  mounted() {
    this.activeTravail = {
      ...this.data,
      sapeurs: [
        { sapeur_id: this.data.sapeur_id, quantite: this.data.quantite },
      ],
    };
    this.initialQuantite = this.data.quantite;
    this.$refs.justification.focus();
  },
  methods: {
    ...mapActions(useModalStore, {
      HIDE_MODAL: 'closeModal',
      UPDATE_MODAL_SIZE: 'resize',
    }),
    async review(accepte) {
      this.$store
        .dispatch('reviewTravail', { ...this.activeTravail, accepte })
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch(
          (errors) =>
            (this.errors = {
              ...errors,
            }),
        );
    },
  },
};
</script>
