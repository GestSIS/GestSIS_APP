<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Modifier présences de {{ sapeur.nom_prenom }}
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body table-responsive">
      <table id="sap-fonctions" class="table table-sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>heure</th>
            <th>Catégorie</th>
            <th>Localité</th>
            <th>Désignation</th>
            <th class="text-center">Convoqué</th>
            <th class="text-center">Présent</th>
            <th class="text-center">Remplacé</th>
            <th class="text-center">Excusé</th>
            <th class="text-center">Amende</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="presences.length <= 0">
            <td colspan="9">Aucun exercice à afficher</td>
          </tr>
          <tr v-for="e in presences" :key="e.id">
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.date.toLocaleDateString('fr-CH') }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.heure }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.categorie }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.localite }}
              </component>
            </td>
            <td>
              <component :is="e.canceled ? 'del' : 'span'">
                {{ e.designation }}
              </component>
            </td>
            <td class="text-center">
              <input
                v-model="e.convoque"
                type="checkbox"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                :disabled="!canEditAbsence(e)"
              />
            </td>
            <td class="text-center">
              <input
                v-model="e.present"
                type="checkbox"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                :disabled="!canEditPresence(e)"
                @change="editPresentCheckbox(e)"
              />
            </td>
            <td class="text-center">
              <input
                v-model="e.remplace"
                type="checkbox"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                :disabled="
                  !canEditAbsence(e) || (!canEditPresence(e) && e.present)
                "
                @change="editRemplaceCheckbox(e)"
              />
            </td>
            <td class="text-center">
              <div class="d-inline-flex">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="e.excuse_type_id"
                  :disabled="
                    !canEditAbsence(e) || (!canEditPresence(e) && e.present)
                  "
                  @update:model-value="editExcuseCheckbox(e)"
                />
                <base-select
                  v-if="e.excuse_type_id"
                  v-model="e.excuse_type_id"
                  class="ms-1"
                  value-key="id"
                  display-key="designation"
                  :options="excusesType"
                  :select-class="{
                    'is-invalid': errors['ecriture_categorie_id'],
                  }"
                  @update:model-value="selectExcuseType(e)"
                />
              </div>
            </td>
            <td class="text-center">
              <input
                v-model="e.amende"
                type="checkbox"
                class="form-check-input"
                :disabled="
                  !canEditAbsence(e) ||
                  (!canEditPresence(e) && e.present) ||
                  !e.amendable
                "
                @change="editAmendeCheckbox(e)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        Enregistrer
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'ModalPresenceExercice',
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
      presences: [],
    };
  },
  computed: {
    ...mapState({
      excusesType: (state) => state.excuseType.liste,
      sapeur: (state) => state.sapeur.active.data,
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurExercice: (state) => state.sapeur.active.exercices,
      currentExerciceComptableId: (state) => state.exerciceComptable.activeId,
      hasPresencePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.PRESENCE),
      hasValidationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.VALIDATION),
    }),
    computeExercices() {
      return this.activeSapeurExercice
        .map((exercice) => ({
          ...exercice,
          canceled: exercice.statut == 0,
          date: new Date(exercice.date),
          heure: exercice.heure.substr(0, 5),
          categorie: this.categories.find(
            (e) => e.id == exercice.exercice_categorie_id
          )?.designation,
          localite: this.localites.find((l) => l.id == exercice.localite_id)
            ?.designation,
          amendable: this.categories.find(
            (c) => c.id == exercice.exercice_categorie_id
          )?.amendable,
        }))
        .sort((a, b) => a.date - b.date);
    },
  },
  mounted() {
    this.presences = [
      ...this.computeExercices.map((e) => ({ ...e.presence, ...e })),
    ];
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    canEditAbsence(exercice) {
      // Possible de l'éditer si permission de validation ou si pas encore validé
      return (
        exercice.statut > 0 &&
        (this.hasValidationPermission ||
          (this.hasPresencePermission && exercice.statut <= 2))
      );
    },
    canEditPresence(exercice) {
      return (
        exercice.statut > 0 &&
        ((this.hasPresencePermission && exercice.statut <= 2) ||
          (this.hasValidationPermission && exercice.statut <= 3))
      );
    },
    editPresentCheckbox(exercice) {
      exercice.remplace = 0;
      exercice.amende = false;
      exercice.excuse_type_id = null;
    },
    editRemplaceCheckbox(exercice) {
      exercice.present = 0;
      exercice.amende = false;
      exercice.excuse_type_id = null;
    },
    editAmendeCheckbox(exercice) {
      exercice.present = 0;
      exercice.remplace = 0;
    },
    editExcuseCheckbox(exercice) {
      exercice.present = 0;
      exercice.remplace = 0;

      exercice.excuse_type_id = exercice.excuse_type_id
        ? null
        : this.excusesType[0].id;
    },
    selectExcuseType(exercice) {
      if (exercice.amendable) {
        const excuse = this.excusesType.find(
          (e) => e.id == exercice.excuse_type_id
        );
        exercice.amende = excuse.amende;
      } else {
        exercice.amende = false;
      }
    },
    async save() {
      this.$store
        .dispatch('updateSapeurPresencesExercice', this.presences)
        .then(this.HIDE_MODAL)
        .catch((error) => {
          this.errors = {
            ...error,
          };
        });
    },
  },
};
</script>

<style scoped></style>
