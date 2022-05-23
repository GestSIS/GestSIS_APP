<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex">
      <h3 class="me-auto">
        {{ activeExerciceData.designation }} &ndash;
        {{ activeExerciceData.date }}
      </h3>
      <button class="btn btn-outline-primary me-2" @click="validate" :disabled="!canValidate"
        v-if="hasValidationPermission">Valider</button>
      <button class="btn btn-outline-primary" @click="save" v-if="hasPresencePermission">Sauvegarder</button>
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
          <th v-for="h in extendedHeureTypes" :key="h.id">{{ h.designation }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="sap in presences" :key="sap.id">
          <td>{{ sap.nomPrenom }}</td>
          <td>
            <div class="text-center">
              <input type="checkbox" :disabled="!hasPresencePermission" class="form-check-input"
                :id="sap.id + 'convoque'" v-model="sap.convoque" :true-value="1" :false-value="0" />
            </div>
          </td>
          <td>
            <div class="text-center">
              <input type="checkbox" :disabled="!hasPresencePermission" class="form-check-input"
                :id="sap.id + 'present'" v-model="sap.present" :true-value="1" :false-value="0"
                @change="selectPresent(sap)" />
              <label class="form-check-label" :for="sap.id + 'present'"></label>
            </div>
          </td>
          <td>
            <div class="text-center">
              <input type="checkbox" :disabled="!hasPresencePermission" class="form-check-input"
                :id="sap.id + 'remplace'" v-model="sap.remplace" :true-value="1" :false-value="0"
                @change="selectRemplace(sap)" />
              <label class="form-check-label" :for="sap.id + 'remplace'"></label>
            </div>
          </td>
          <td>
            <div class="text-center">
              <input type="checkbox" :disabled="!hasPresencePermission" class="form-check-input" :id="sap.id + 'excuse'"
                :checked="!!sap.excuse_type_id" @change.stop.prevent="selectExcuse(sap)" />
              <label class="form-check-label" :for="sap.id + 'excuse'">
                <span v-if="sap.excuse_type_id && sap.excuse_type_id !== true">{{
                    formatExcuseType(sap.excuse_type_id)
                }}</span>
              </label>
            </div>
          </td>
          <td>
            <div class="text-center">
              <input type="checkbox" class="form-check-input" :id="sap.id + 'amende'" v-model="sap.amende"
                :true-value="true" :false-value="false"
                :disabled="!amendable || !!(sap.remplace || sap.present) || !hasPresencePermission" />
              <label class="form-check-label" :for="sap.id + 'amende'"></label>
            </div>
          </td>
          <td v-for="h in extendedHeureTypes" :key="h.id">
            <div class="input-group input-group-sm">
              <input class="form-control form-control-sm" type="text" :readonly="!hasPresencePermission" :value="
                getHeureValue(
                  sap.heures.find(
                    (e) =>
                      e.heure_exercice_type_id == h.id ||
                      (!e.heure_exercice_type_id &&
                        e.designation == h.designation)
                  )
                )
              " @change="(e) => updateHeureSapeur(sap, h, e.target.value)" />
              <span class="input-group-text">{{ formatUnite(h.type_unite_id) }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <p class="ms-2" v-if="activeExerciceSapeurs.length === 0">Aucun sapeur</p>
    <div class="card-footer">
      <button class="btn btn-outline-primary" @click="manageSapeurs" v-if="hasPresencePermission">Gérer la liste des
        sapeurs</button>
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
    }
  },
  computed: {
    ...mapState({
      excusesTypes: (state) => state.excuseType.liste,
      sapeurs: (state) => state.sapeur.liste,
      hasValidationPermission: (state) =>
        state.auth.sis.permissions.includes(
          permissions.EXERCICE.VALIDATION
        ),
      // TODO: Check si exercice pas déjà imputé
      hasPresencePermission: (state) => state.auth.sis.permissions.includes(
        permissions.EXERCICE.PRESENCE
      ),
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
    canValidate() {
      return this.activeExerciceData.statut == 2;
    },
    extendedHeureTypes() {
      return this.heureTypes;
    },
    computedExerciceSapeurs() {
      return this.activeExerciceSapeurs
        .map(s => ({ ...s, nomPrenom: this.formatSapeur(s.sapeur_id) }))
        .sort((a, b) => a.nomPrenom.localeCompare(b.nomPrenom))
    }
  },
  mounted() {
    this.presences = this.computedExerciceSapeurs.map(s => ({ ...s }));
  },
  watch: {
    computedExerciceSapeurs() {
      this.presences = this.computedExerciceSapeurs.map(s => ({ ...s }));
    }
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
    formatSapeur(sapeur_id) {
      const sapeur = this.sapeurs.find((s) => s.id == sapeur_id);
      return sapeur ? sapeur.nom + ' ' + sapeur.prenom : '...';
    },
    formatExcuseType(id) {
      return this.excusesTypes.find((e) => e.id == id)?.designation;
    },
    manageSapeurs() {
      const data = this.presences.map((s) => s.sapeur_id).slice(0);
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
              .catch((error) => {
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
