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
      />
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeTravail.designation"
          type="text"
          class="form-control form-control-sm"
        />
      </div>
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          id="date"
          v-model="activeTravail.date"
          type="date"
          class="form-control form-control-sm"
        />
      </div>
      <base-select
        v-model="activeTravail.sapeur_id"
        class="mb-3"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs"
      />
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
                  ?.type_unite_id
            )?.unite
          }}</span
        >
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeTravail.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

import permissions from '../../store/permissions.js';

export default {
  name: 'ModalTravailType',
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
          permissions.FICHE_TRAVAIL.SAISIE_COMMUNE
        ),
    }),
  },
  watch: {
    parFonction: function (val) {
      this.UPDATE_MODAL_SIZE(val ? 2 : 0);
    },
  },
  mounted() {
    if (this.data.id) {
      this.activeTravail = {
        ...this.data,
        sapeurs: [
          { sapeur_id: this.data.sapeur_id, quantite: this.data.quantite },
        ],
      };
    } else {
      this.activeTravail.exercice_comptable_id = this.activeExerciceComptableId;
      if (!this.hasSaisieCommunePermission) {
        this.activeTravail.sapeurs[0].sapeur_id = this.activeSapeurId;
      }
    }
  },
  methods: {
    ...mapMutations(['HIDE_MODAL', 'UPDATE_MODAL_SIZE']),
    updateTarif(index, e) {
      this.activeTravail.fonctions[index].tarif = e.target.value;
    },
    updateIndemnite(index, e) {
      this.activeTravail.fonctions[index].indemnite = e.target.value;
    },
    ajoutType() {
      this.activeTravail.sapeurs.push({
        sapeur_id: null,
        quantite: null,
      });

      const count = this.activeTravail.sapeurs.length;
      this.$nextTick(() => {
        this.$refs[`sapeur-${count - 1}`][0].focus();
      });
    },
    supprimerType(i) {
      this.activeTravail.sapeurs.splice(i, 1);
    },
    async save() {
      this.errors = {};

      // Contrôle qu'aucune colonne n'est dupliquée
      const sapeurIds = new Set(
        this.activeTravail.sapeurs.map((e) => e.sapeur_id)
      );
      if (sapeurIds.size != this.activeTravail.sapeurs.length) {
        this.$awn.alert('Erreur, un sapeur a été saisie à double.');
        return;
      }

      // Return en cas d'erreurs
      if (Object.keys(this.errors).length > 0) {
        return;
      }

      let promise = null;
      if ((this.activeTravail.id ?? 0) === 0) {
        const travaux = this.activeTravail.sapeurs.map((s) => ({
          ...this.activeTravail,
          sapeurs: undefined,
          ...s,
        }));
        promise = this.$store.dispatch('addTravaux', travaux);
      } else {
        const travail = {
          ...this.activeTravail,
          sapeur_id: this.activeTravail.sapeurs[0].sapeur_id,
          quantite: this.activeTravail.sapeurs[0].quantite,
        };
        promise = this.$store.dispatch('updateTravail', travail);
      }
      promise
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
  },
};
</script>

<style scoped></style>
