<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeTravail.id ? 'Modifier' : 'Ajouter' }} un travail
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="activeTravail.travail_type_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['travail_type_id'] }"
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
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          id="date"
          v-model="activeTravail.date"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
      <base-select
        v-if="activeTravail?.id && hasSaisieCommunePermission"
        v-model="activeTravail.sapeurs[0].sapeur_id"
        class="mb-3"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs"
      />
      <label
        v-if="activeTravail?.id || !hasSaisieCommunePermission"
        for="quantite"
        >Quantité</label
      >
      <div
        v-if="activeTravail?.id || !hasSaisieCommunePermission"
        class="input-group input-group-sm mb-3"
      >
        <input
          id="quantite"
          v-model="activeTravail.sapeurs[0].quantite"
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
      <div v-if="!activeTravail?.id && hasSaisieCommunePermission" class="mb-3">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Sapeur</th>
              <th>Quantité</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in activeTravail.sapeurs" :key="i">
              <td class="col-8">
                <base-select
                  :ref="'sapeur-' + i"
                  v-model="item.sapeur_id"
                  :class="{ 'is-invalid': errors['base-type' + i] }"
                  display-key="nom_prenom"
                  :options="sapeurs"
                />
              </td>
              <td class="col-3">
                <div class="input-group input-group-sm">
                  <input
                    v-if="activeUnite?.comptable"
                    id="quantite"
                    v-model="item.quantite"
                    type="number"
                    min="0"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['base-quantite' + i] }"
                  />
                  <input
                    v-if="!activeUnite?.comptable"
                    :value="1"
                    type="number"
                    :disabled="true"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['base-quantite' + i] }"
                  />
                  <span class="input-group-text">
                    {{ activeUnite?.unite }}</span
                  >
                </div>
              </td>
              <td class="text-center">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  :disabled="activeTravail.sapeurs.length <= 1"
                  @click="supprimerType(i)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="3">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  @click="ajoutType()"
                >
                  Ajouter
                  <font-awesome-icon size="1x" :icon="['far', 'plus-square']" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
import { mapState } from 'vuex';
import { mapActions } from 'pinia';
import { useModalStore } from '../../stores/common/Modal.js';

import permissions from '../../store/permissions.js';

export default {
  name: 'ModalTravailType',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
    callback: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
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
          permissions.FICHE_TRAVAIL.SAISIE_COMMUNE,
        ),
    }),
    activeUnite() {
      return this.unites.find(
        (u) =>
          u.id ===
          this.travailTypes.find(
            (t) => t.id === this.activeTravail.travail_type_id,
          )?.type_unite_id,
      );
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
    ...mapActions(useModalStore, {
      HIDE_MODAL: 'closeModal',
      UPDATE_MODAL_SIZE: 'resize',
    }),
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
        this.activeTravail.sapeurs.map((e) => e.sapeur_id),
      );
      if (sapeurIds.size != this.activeTravail.sapeurs.length) {
        this.$awn.alert('Erreur, un sapeur a été saisie à double.');
        return;
      }

      // Return en cas d'erreurs
      if (Object.keys(this.errors).length > 0) {
        return;
      }

      if (!this.activeUnite?.comptable) {
        this.activeTravail.sapeurs = this.activeTravail.sapeurs.map((s) => ({
          ...s,
          quantite: 1,
        }));
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
          this.callback(true);
          this.HIDE_MODAL();
        })
        .catch((errors) => {
          this.errors = {
            ...errors,
          };
          this.$awn.alert(errors?.message ?? "Erreur lors de l'enregistrement");
        });
    },
  },
};
</script>

<style scoped></style>
