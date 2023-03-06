<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Modifier présences de {{ sapeur?.nom_prenom }}
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
            <th class="text-center">Absent</th>
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
                @change="selectPresent(e)"
              />
            </td>
            <td class="text-center">
              <input
                v-model="e.absent"
                type="checkbox"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                :disabled="
                  !canEditAbsence(e) || (!canEditPresence(e) && e.present)
                "
                @change="selectAbsent(e)"
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
                @change="selectRemplace(e)"
              />
            </td>
            <td>
              <div class="text-center">
                <span
                  v-if="e.excuse_type_id && e.excuse_type_id !== true"
                  class="badge rounded-pill text-bg-primary"
                  :class="{
                    'text-bg-danger': e.excuse_statut == -1,
                    'text-bg-secondary': e.excuse_statut == 0,
                    'text-bg-success': e.excuse_statut == 1,
                  }"
                  @click="detailExcuse(e)"
                  >{{
                    excusesTypes.find((i) => i.id == e.excuse_type_id)
                      ?.designation
                  }}</span
                >
                <button
                  v-if="e.justificatif_filename"
                  class="btn"
                  @click="downloadJustificatif(e)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
                <button
                  v-if="!e.excuse_type_id"
                  class="btn btn-outline-primary border-0"
                  @click="addExcuse(e)"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
                <button
                  v-else
                  class="btn btn-outline-danger border-0"
                  @click="removeExcuse(e)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
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
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import ExerciceService from '../../services/ExerciceService';
import permissions from '/src/store/permissions.js';

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
      excusesTypes: (state) => state.excuseType.liste,
      sapeur: (state) =>
        state.sapeur.liste.find((s) => s.id == state.sapeur.active.id),
      localites: (state) => state.localite.liste,
      categories: (state) => state.exerciceCategorie.liste,
      activeSapeurId: (state) => state.sapeur.active.id,
      activeSapeurExercice: (state) => state.sapeur.active.exercices,
      activeExerciceComptableId: (state) => state.exerciceComptable.activeId,
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
    ...mapMutations(['HIDE_MODAL', 'SHOW_MODAL']),
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
    savePresence(sapeur) {
      this.$store
        .dispatch('editPresenceExercice', sapeur)
        .then((res) =>
          this.$awn.success(res?.message || 'Modifications enregistrées')
        )
        .catch((err) =>
          this.$awn.alert(err?.message || "Erreur lors de l'enregistrement")
        );
    },
    selectPresent(sapeur) {
      sapeur.remplace = 0;
      sapeur.absent = 0;
      sapeur.amende = false;
      this.savePresence(sapeur);
    },
    selectAbsent(sapeur) {
      sapeur.remplace = 0;
      sapeur.present = 0;
      this.savePresence(sapeur);
    },
    selectRemplace(sapeur) {
      sapeur.present = 0;
      sapeur.absent = 0;
      sapeur.amende = false;
      this.savePresence(sapeur);
    },
    detailExcuse(sapeur) {
      this.SHOW_MODAL({
        component: 'ModalExcuse',
        data: sapeur,
        callback: (presence) => {
          if (presence !== null && presence !== undefined) {
            presence.present = 0;
            presence.remplace = 0;
            this.savePresence(presence);
            this.presences = [
              ...this.presences.map((p) =>
                parseInt(p.id) == parseInt(presence.id) ? presence : p
              ),
            ];
          }
          this.SHOW_MODAL({
            component: 'ModalPresenceExercice',
            size: 2,
          });
          return Promise.resolve(false);
        },
      });
    },
    async addExcuse(sapeur) {
      this.SHOW_MODAL({
        component: 'ModalExcuse',
        data: sapeur,
        callback: (presence) => {
          if (presence !== null && presence !== undefined) {
            presence.present = 0;
            presence.absent = 1;
            presence.remplace = 0;
            this.savePresence(presence);
            this.presences = [
              ...this.presences.map((p) =>
                parseInt(p.id) == parseInt(presence.id) ? presence : p
              ),
            ];
          }
          this.SHOW_MODAL({
            component: 'ModalPresenceExercice',
            size: 2,
          });
          return Promise.resolve(false);
        },
      });
    },
    removeExcuse(sapeur) {
      this.SHOW_MODAL({
        component: 'ModalConfirmation',
        data: {
          title: 'Voulez-vous vraiment supprimer cette excuse ?',
          question:
            "Attention, la suppression d'une excuse est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
        },
        callback: (confirmed) => {
          if (confirmed) {
            this.$store.dispatch('removeExcuse', sapeur?.id);
          }
          this.SHOW_MODAL({
            component: 'ModalPresenceExercice',
            size: 2,
          });
          return Promise.resolve(false);
        },
      });
    },
    downloadJustificatif(sapeur) {
      ExerciceService.downloadExcuseJustificatif(
        sapeur.exercice_id,
        sapeur.sapeur_id,
        'justificatif.pdf'
      ).catch((err) =>
        this.$awn.alert(
          err?.message ?? 'Erreur lors du chargement du justificatif'
        )
      );
    },
  },
};
</script>

<style scoped></style>
