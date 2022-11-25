<template>
  <div
    v-if="!dismissedWarning && canEditAbsence && !canEditPresence"
    class="alert alert-dismissible alert-warning"
  >
    <button
      type="button"
      class="btn-close"
      data-bs-dismiss="alert"
      @click="dismissedWarning = true"
    ></button>
    Exercice déjà imputé, uniquement possible de modifier le type d'absence et
    la mise à l'amende.
  </div>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex">
      <h3 class="me-auto">
        {{ activeExerciceData.designation }} &ndash;
        {{ new Date(activeExerciceData.date).toLocaleDateString('fr-CH') }}
      </h3>
      <button
        v-if="hasValidationPermission"
        class="btn btn-outline-primary me-2"
        :disabled="!canValidate"
        @click="validate"
      >
        Valider
      </button>
      <button
        v-if="hasPresencePermission"
        class="btn btn-outline-primary"
        @click="save"
      >
        Sauvegarder
      </button>
    </div>
    <table class="table table-sm">
      <thead>
        <tr>
          <th>Nom</th>
          <th class="text-center">Convoque</th>
          <th class="text-center">Present</th>
          <th class="text-center">Remplace</th>
          <th class="text-center">Excuse</th>
          <th class="text-center">Amende</th>
          <th v-for="h in heureTypes" :key="h.id">
            {{ h.designation }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="sap in presences"
          :key="sap.id"
          :class="{ 'table-danger': !sap.actif }"
        >
          <td>{{ sap.nom_prenom }}</td>
          <td>
            <div class="text-center">
              <input
                :id="sap.id + 'convoque'"
                v-model="sap.convoque"
                type="checkbox"
                :disabled="!canEditPresence"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
              />
            </div>
          </td>
          <td>
            <div class="text-center">
              <input
                :id="sap.id + 'present'"
                v-model="sap.present"
                type="checkbox"
                :disabled="!canEditPresence"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                @change="selectPresent(sap)"
              />
              <label class="form-check-label" :for="sap.id + 'present'"></label>
            </div>
          </td>
          <td>
            <div class="text-center">
              <input
                :id="sap.id + 'remplace'"
                v-model="sap.remplace"
                type="checkbox"
                :disabled="!canEditAbsence || (!canEditPresence && sap.present)"
                class="form-check-input"
                :true-value="1"
                :false-value="0"
                @change="selectRemplace(sap)"
              />
              <label
                class="form-check-label"
                :for="sap.id + 'remplace'"
              ></label>
            </div>
          </td>
          <td>
            <div class="text-center">
              <input
                :id="sap.id + 'excuse'"
                type="checkbox"
                :disabled="!canEditAbsence || (!canEditPresence && sap.present)"
                class="form-check-input"
                :checked="!!sap.excuse_type_id"
                @change.stop.prevent="selectExcuse(sap)"
              />
              <label class="form-check-label" :for="sap.id + 'excuse'">
                <span
                  v-if="sap.excuse_type_id && sap.excuse_type_id !== true"
                  >{{ formatExcuseType(sap.excuse_type_id) }}</span
                >
              </label>
            </div>
          </td>
          <td>
            <div class="text-center">
              <input
                :id="sap.id + 'amende'"
                v-model="sap.amende"
                type="checkbox"
                class="form-check-input"
                :true-value="true"
                :false-value="false"
                :disabled="
                  !canEditAbsence ||
                  (!canEditPresence && sap.present) ||
                  !amendable ||
                  !!(sap.remplace || sap.present)
                "
              />
              <label class="form-check-label" :for="sap.id + 'amende'"></label>
            </div>
          </td>
          <td v-for="h in heureTypes" :key="h.id">
            <div class="input-group input-group-sm">
              <input
                class="form-control form-control-sm"
                type="text"
                :readonly="!canEditPresence"
                :value="
                  getHeureValue(
                    sap.heures.find(
                      (e) =>
                        e.heure_exercice_type_id == h.id ||
                        (!e.heure_exercice_type_id &&
                          e.designation == h.designation)
                    )
                  )
                "
                @change="(e) => updateHeureSapeur(sap, h, e.target.value)"
              />
              <span class="input-group-text">{{
                formatUnite(h.type_unite_id)
              }}</span>
            </div>
          </td>
        </tr>
        <tr v-if="activeExerciceSapeurs.length === 0">
          <td :colspan="6 + heureTypes.length">Aucun sapeur</td>
        </tr>
      </tbody>
      <tfoot>
        <th>Nb sapeurs : {{ presences.length }}</th>
        <th class="text-center">
          {{ presences.filter((s) => s.convoque).length }}
        </th>
        <th class="text-center">
          {{ presences.filter((s) => s.present).length }}
        </th>
        <th class="text-center">
          {{ presences.filter((s) => s.remplace).length }}
        </th>
        <th class="text-center">
          {{ presences.filter((s) => s.excuse_type_id).length }}
        </th>
        <th class="text-center">
          {{ presences.filter((s) => s.amende).length }}
        </th>
        <th v-for="h in heureTypes" :key="h.id" class="text-center">
          {{
            presences
              .map((s) =>
                parseFloat(
                  s.heures.find((e) => e.heure_exercice_type_id == h.id)
                    ?.quantite ?? 0
                )
              )
              .reduce((acc, a) => acc + a, 0)
          }}
          {{ formatUnite(h.type_unite_id) }}
        </th>
      </tfoot>
    </table>
    <div class="card-footer">
      <button
        v-if="hasPresencePermission"
        class="btn btn-outline-primary"
        :disabled="!canEditPresence"
        @click="manageSapeurs"
      >
        Gérer la liste des sapeurs
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';
import permissions from '@/store/permissions.js';

export default {
  name: 'ExerciceTabSapeurs',
  data: () => {
    return {
      presences: [],
      dismissedWarning: false,
    };
  },
  computed: {
    ...mapState({
      excusesTypes: (state) => state.excuseType.liste,
      sapeurs: (state) => state.sapeur.liste,
      hasPresencePermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.PRESENCE),
      hasValidationPermission: (state) =>
        state.auth.admin ||
        state.auth.sis.permissions.includes(permissions.EXERCICE.VALIDATION),
      activeExerciceId: (state) => state.exercice.active.id,
      activeExerciceData: (state) => state.exercice.active.data,
      activeExerciceSapeurs: (state) => state.exercice.active.sapeurs,
      heureTypes: (state) => state.heureExercice.liste,
      unites: (state) => state.unite.liste,
      categories: (state) => state.exerciceCategorie.liste,
      id: (state) => state.exercice.active.data?.exercice_categorie_id,
      amendable: (state) =>
        state.exerciceCategorie.liste.find(
          (c) => c.id == state.exercice.active.data?.exercice_categorie_id
        )?.amendable,
    }),
    isImpute() {
      return this.activeExerciceData.statut == 4;
    },
    canEditAbsence() {
      // Possible de l'éditer si permission de validation ou si pas encore validé
      return (
        this.activeExerciceData.statut > 0 &&
        (this.hasValidationPermission ||
          (this.hasPresencePermission && this.activeExerciceData.statut <= 2))
      );
    },
    canEditPresence() {
      return (
        this.activeExerciceData.statut > 0 &&
        ((this.hasPresencePermission && this.activeExerciceData.statut <= 2) ||
          (this.hasValidationPermission && this.activeExerciceData.statut <= 3))
      );
    },
    canValidate() {
      return this.activeExerciceData.statut == 2;
    },
    computedExerciceSapeurs() {
      return this.activeExerciceSapeurs
        .map((s) => {
          const sapeur = this.sapeurs.find((sap) => sap.id == s.sapeur_id);
          return {
            ...s,
            nom_prenom: sapeur?.nom_prenom ?? '...',
            actif: sapeur?.actif,
          };
        })
        .sort((a, b) => a.nom_prenom.localeCompare(b.nom_prenom));
    },
  },
  watch: {
    computedExerciceSapeurs() {
      this.presences = this.computedExerciceSapeurs.map((s) => ({ ...s }));
    },
  },
  mounted() {
    this.presences = this.computedExerciceSapeurs.map((s) => ({ ...s }));
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    getHeureValue(sapeur) {
      return sapeur?.quantite;
    },
    updateHeureSapeur(sap, h, quantite) {
      const heure = sap.heures.find(
        (e) =>
          e.heure_exercice_type_id == h.id ||
          (!e.heure_exercice_type_id && e.designation == h.designation)
      );
      if (!heure) {
        // Ajout de l'heure
        sap.heures = [
          ...sap.heures,
          {
            heure_exercice_type_id: h.id,
            quantite,
          },
        ];
      } else {
        // Modification de l'heure
        heure.quantite = parseFloat(quantite) || null;
      }
    },
    async save() {
      this.$store
        .dispatch('editSapeurs', this.presences)
        .then((res) =>
          this.$awn.success(res?.message || 'Modifications enregistrées')
        )
        .catch((err) =>
          this.$awn.alert(err?.message || "Erreur lors de l'enregistrement")
        );
    },
    async validate() {
      this.$store
        .dispatch('validerExercice', this.activeExerciceId)
        .then((res) =>
          this.$awn.success(res?.message || 'Exercice validé avec succès.')
        )
        .catch((err) =>
          this.$awn.alert(
            err?.message || "Erreur lors de la validation de l'exercice."
          )
        );
    },
    formatUnite(type_unite_id) {
      return this.unites.find((u) => u.id == type_unite_id)?.abreviation;
    },
    formatExcuseType(id) {
      return this.excusesTypes.find((e) => e.id == id)?.designation;
    },
    manageSapeurs() {
      const data = {
        ids: this.presences.map((s) => s.sapeur_id).slice(0),
      };
      let svm = this;
      let callback = (param) => {
        if (!param) {
          return;
        }
        const { ajoute, supprime } = param;
        if (ajoute === null || ajoute === undefined) {
          return;
        }

        return new Promise((resolve, reject) => {
          let newSapeurs = ajoute.map((s) => ({
            convoque: true,
            present: false,
            remplace: false,
            excuse_type_id: null,
            sapeur_id: s,
            amende: false,
          }));

          //Sapeurs ajoutés
          if (newSapeurs.length > 0) {
            svm.$store
              .dispatch('addSapeurs', newSapeurs)
              .then(() => {
                if (supprime.length <= 0) {
                  resolve();
                }
              })
              .catch(() => {
                reject("Erreur lors de l'opération");
              });
          }

          if (supprime.length > 0) {
            svm.$store
              .dispatch('removeSapeurs', supprime)
              .then(resolve)
              .catch(() => {
                reject("Erreur lors de l'opération");
              });
          }

          if (newSapeurs.length <= 0 && supprime.length <= 0) {
            resolve('Solved');
          }
        });
      };
      //this.$store.dispatch('resetActiveFonction')

      this.SHOW_MODAL({
        component: 'ModalSapeurSelect',
        size: 1,
        callback,
        data,
      });
    },
    selectPresent(sapeur) {
      sapeur.remplace = 0;
      sapeur.amende = false;
      sapeur.excuse_type_id = null;
    },
    selectRemplace(sapeur) {
      sapeur.present = 0;
      sapeur.amende = false;
      sapeur.excuse_type_id = null;
    },
    async selectExcuse(sapeur) {
      if (sapeur.excuse_type_id) {
        sapeur.excuse_type_id = null;
      }
      let self = this;
      this.SHOW_MODAL({
        component: 'ModalExcuse',
        callback: (excuseTypeId) => {
          if (excuseTypeId !== null && excuseTypeId !== undefined) {
            let excuseType = self.excusesTypes.find(
              (e) => e.id == excuseTypeId
            );
            sapeur.present = 0;
            sapeur.remplace = 0;
            sapeur.amende = this.amendable && excuseType.amende;
            sapeur.excuse_type_id = excuseTypeId;
          } else {
            sapeur.excuse_type_id = null;
          }
        },
      });
    },
  },
};
</script>

<style scoped lang="scss">
thead {
  position: sticky;
  top: 0;
  z-index: 12;
  background-color: white;
}
</style>
