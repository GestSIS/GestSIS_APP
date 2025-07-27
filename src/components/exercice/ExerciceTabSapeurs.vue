<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import ExerciceService from '../../services/ExerciceService';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';

const store = useStore();
store.dispatch('fetchListeSapeur');
store.dispatch('fetchLocalites');
store.dispatch('fetchExerciceCategories');
store.dispatch('fetchExercicesComptables');
store.dispatch('fetchExcuseTypes');
store.dispatch('fetchHeuresExercice');
store.dispatch('fetchUnites');

const { id } = defineProps({
  id: {
    type: String,
    default: 'new',
  },
});

const presences = ref([]);
const dismissedWarning = ref(false);
const allConvoque = ref(false);

const loading = ref(false);
const activeExerciceSapeurs = computed(
  () => store.state.exercice.active.sapeurs,
);
watchEffect(async () => {
  loading.value = true;
  await Promise.all([
    store.dispatch('fetchExercice', id),
    store.dispatch('fetchExerciceSapeurs', id),
  ]);
  loading.value = false;
});

const sapeurs = computed(() => store.state.sapeur.liste);
watchEffect(() => {
  presences.value = store.state.exercice.active.sapeurs
    .map((s) => {
      const sapeur = sapeurs.value.find((sap) => sap.id == s.sapeur_id);
      return {
        ...s,
        nom_prenom: sapeur?.nom_prenom ?? '...',
        actif: sapeur?.actif,
      };
    })
    .sort((a, b) => a.nom_prenom.localeCompare(b.nom_prenom));
});

watchEffect(() => {
  const status = presences.value?.map((p) => (p.convoque === 1 ? true : false));
  allConvoque.value = status.length
    ? status.reduce((c2, c1) => (c1 === c2 ? c1 : ''))
    : false;
});

const excusesTypes = computed(() => store.state.excuseType.liste);

const hasPresencePermission = useHasPermission(permissions.EXERCICE.PRESENCE);
const hasValidationPermission = useHasPermission(
  permissions.EXERCICE.VALIDATION,
);
const activeExerciceData = computed(() => store.state.exercice.active.data);
const heureTypes = computed(() => store.state.heureExercice.liste);
const unites = computed(() => store.state.unite.liste);

const canEditAbsence = computed(() => {
  // Possible de l'éditer si permission de validation ou si pas encore validé
  return (
    activeExerciceData.value.statut > 0 &&
    (hasValidationPermission.value ||
      (hasPresencePermission.value && activeExerciceData.value.statut <= 2))
  );
});
const canEditPresence = computed(() => {
  return (
    activeExerciceData.value.statut > 0 &&
    ((hasPresencePermission.value && activeExerciceData.value.statut <= 2) ||
      (hasValidationPermission.value && activeExerciceData.value.statut <= 3))
  );
});
const canValidate = computed(() => {
  return activeExerciceData.value.statut == 2;
});

const { showModal } = useModalStore();
const awn = inject('awn');

const selectAllConvoque = (status) => {
  presences.value = presences.value.map((p) => ({
    ...p,
    convoque: status ? 1 : 0,
  }));
  Promise.all(presences.value.map((p) => savePresence(p, true))).then(
    awn.success('Modifications enregistrées'),
  );
};
const getHeureValue = (sapeur) => {
  return sapeur?.quantite;
};
const updateHeureSapeur = (sap, h, quantite) => {
  const heure = sap.heures.find(
    (e) =>
      e.heure_exercice_type_id == h.id ||
      (!e.heure_exercice_type_id && e.designation == h.designation),
  );
  if (!heure) {
    // Ajout de l'heure
    const newHeure = {
      heure_exercice_type_id: h.id,
      quantite: parseFloat(quantite) || null,
      exercice_id: id,
      sapeur_id: sap.sapeur_id,
    };

    store
      .dispatch('addHeure', newHeure)
      .then(() => awn.success('Heure ajoutée'))
      .catch((err) =>
        awn.alert(err?.message || "Erreur lors de l'enregistrement"),
      );
  } else if (!(parseFloat(quantite) || null)) {
    // Suppression de l'heure
    store
      .dispatch('removeHeure', heure)
      .then(() => awn.success('Heure supprimée'))
      .catch((err) =>
        awn.alert(err?.message || "Erreur lors de l'enregistrement"),
      );
  } else {
    heure.quantite = parseFloat(quantite) || null;
    // Modification de l'heure
    store
      .dispatch('editHeure', heure)
      .then(() => awn.success('Modifications enregistrées'))
      .catch((err) =>
        awn.alert(err?.message || "Erreur lors de l'enregistrement"),
      );
  }
};
const validate = () => {
  store
    .dispatch('validerExercice', id)
    .then((res) => awn.success(res?.message || 'Exercice validé avec succès.'))
    .catch((err) =>
      awn.alert(err?.message || "Erreur lors de la validation de l'exercice."),
    );
};
const formatUnite = (type_unite_id) => {
  return unites.value.find((u) => u.id == type_unite_id)?.abreviation;
};
const manageSapeurs = () => {
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
        absent: false,
        remplace: false,
        excuse_type_id: null,
        sapeur_id: s,
        amende: false,
      }));

      //Sapeurs ajoutés
      if (newSapeurs.length > 0) {
        store
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
        store
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
  showModal({
    component: 'ModalSapeurSelect',
    size: 1,
    callback,
    data: { ids: presences.value.map((s) => s.sapeur_id) },
  });
};
const savePresence = async (sapeur, hideNotification) => {
  const promise = store.dispatch('editPresenceExercice', {
    presenceId: sapeur.id,
    presence: sapeur,
  });
  if (!hideNotification) {
    try {
      const res = await promise;
      return awn.success(res?.message || 'Modifications enregistrées');
    } catch (err) {
      return awn.alert(err?.message || "Erreur lors de l'enregistrement");
    }
  } else {
    return promise;
  }
};
const selectConvoque = (sapeur) => {
  savePresence(sapeur);
};
const selectPresent = (sapeur) => {
  sapeur.remplace = 0;
  sapeur.absent = 0;
  sapeur.excuse_statut = 0;
  savePresence(sapeur);
};
const selectAbsent = (sapeur) => {
  sapeur.remplace = 0;
  sapeur.present = 0;
  savePresence(sapeur);
};
const selectRemplace = (sapeur) => {
  sapeur.present = 0;
  sapeur.absent = 0;
  sapeur.excuse_statut = 0;
  savePresence(sapeur);
};
const detailExcuse = (sapeur) => {
  if (!hasPresencePermission.value) {
    awn.warning(
      "Permissions insuffisantes pour accéder au détails de l'excuse",
    );
    return;
  }
  showModal({
    component: 'ModalExcuse',
    data: sapeur,
    callback: async (presence) => {
      if (presence !== null && presence !== undefined) {
        presence.present = 0;
        presence.remplace = 0;
        await savePresence(presence);
        presences.value = [
          ...presences.value.map((p) =>
            parseInt(p.id) == parseInt(presence.id) ? presence : p,
          ),
        ];
      }
    },
  });
};
const addExcuse = (sapeur) =>
  showModal({
    component: 'ModalExcuse',
    data: sapeur,
    callback: async (presence) => {
      if (presence !== null && presence !== undefined) {
        presence.present = 0;
        presence.absent = 1;
        presence.remplace = 0;
        await savePresence(presence);
        presences.value = [
          ...presences.value.map((p) =>
            parseInt(p.id) == parseInt(presence.id) ? presence : p,
          ),
        ];
      }
    },
  });

const removeExcuse = (sapeur) =>
  confirm(
    'Voulez-vous vraiment supprimer cette excuse ?',
    "Attention, la suppression d'une excuse est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
  ).then(() => store.dispatch('removeExcuse', sapeur));

const downloadJustificatif = (sapeur) => {
  if (!hasPresencePermission.value) {
    awn.warning(
      "Permissions insuffisantes pour accéder au détails de l'excuse",
    );
    return;
  }
  ExerciceService.downloadExcuseJustificatif(
    sapeur.exercice_id,
    sapeur.sapeur_id,
    'justificatif_' + sapeur.justificatif_filename,
  ).catch((err) =>
    awn.alert(err?.message ?? 'Erreur lors du chargement du justificatif'),
  );
};

const statuts = [
  { id: -2, designation: 'Amendée' },
  { id: -1, designation: 'Refusée' },
  { id: 0, designation: 'A traiter' },
  { id: 1, designation: 'Acceptée' },
];
</script>

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
      <button
        v-if="hasPresencePermission"
        class="btn btn-outline-primary"
        :disabled="!canEditPresence"
        @click="manageSapeurs"
      >
        Gérer la liste des sapeurs
      </button>
      <button
        v-if="hasValidationPermission"
        class="btn btn-outline-primary ms-2"
        :disabled="!canValidate"
        @click="validate"
      >
        Valider
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Nom</th>
            <th class="text-center">
              <input
                v-model="allConvoque"
                class="form-check-input"
                type="checkbox"
                @change="(e) => selectAllConvoque(e.target.checked)"
              />
              Convoque
            </th>
            <th class="text-center">Present</th>
            <th class="text-center">Absent</th>
            <th class="text-center">Remplace</th>
            <th class="text-center">Excuse</th>
            <th class="text-center">Statut</th>
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
                  @change="selectConvoque(sap)"
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
                <label
                  class="form-check-label"
                  :for="sap.id + 'present'"
                ></label>
              </div>
            </td>
            <td>
              <div class="text-center">
                <input
                  :id="sap.id + 'absent'"
                  v-model="sap.absent"
                  type="checkbox"
                  :disabled="!canEditPresence"
                  class="form-check-input"
                  :true-value="1"
                  :false-value="0"
                  @change="selectAbsent(sap)"
                />
                <label
                  class="form-check-label"
                  :for="sap.id + 'absent'"
                ></label>
              </div>
            </td>
            <td>
              <div class="text-center">
                <input
                  :id="sap.id + 'remplace'"
                  v-model="sap.remplace"
                  type="checkbox"
                  :disabled="
                    !canEditAbsence || (!canEditPresence && sap.present)
                  "
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
                <span
                  v-if="sap.excuse_type_id && sap.excuse_type_id !== true"
                  class="badge rounded-pill text-bg-primary"
                  :class="{
                    'text-bg-danger': sap.excuse_statut == -2,
                    'text-bg-warning': sap.excuse_statut == -1,
                    'text-bg-secondary': sap.excuse_statut == 0,
                    'text-bg-success': sap.excuse_statut == 1,
                  }"
                  @click="detailExcuse(sap)"
                  >{{
                    excusesTypes.find((e) => e.id == sap.excuse_type_id)
                      ?.designation
                  }}</span
                >
                <button
                  v-if="sap.justificatif_path"
                  class="btn"
                  @click="downloadJustificatif(sap)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
                <button
                  v-if="!sap.excuse_type_id"
                  class="btn btn-outline-primary border-0"
                  :disabled="!hasPresencePermission"
                  @click="addExcuse(sap)"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
                <button
                  v-else
                  class="btn btn-outline-danger border-0"
                  :disabled="!hasPresencePermission"
                  @click="removeExcuse(sap)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </div>
            </td>
            <td>
              <div class="text-center">
                <span
                  v-if="sap.absent"
                  class="badge rounded-pill text-bg-primary"
                  :class="{
                    'text-bg-danger': sap.excuse_statut == -2,
                    'text-bg-warning': sap.excuse_statut == -1,
                    'text-bg-secondary': sap.excuse_statut == 0,
                    'text-bg-success': sap.excuse_statut == 1,
                  }"
                  @click="detailExcuse(sap)"
                  >{{
                    statuts.find((s) => s.id == sap.excuse_statut)?.designation
                  }}</span
                >
                <button
                  v-if="sap.justificatif_path"
                  class="btn"
                  @click="downloadJustificatif(sap)"
                >
                  <font-awesome-icon :icon="['far', 'file-pdf']" />
                </button>
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
                            e.designation == h.designation),
                      ),
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
            <td :colspan="7 + heureTypes.length">Aucun sapeur</td>
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
            {{ presences.filter((s) => s.absent).length }}
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
                      ?.quantite ?? 0,
                  ),
                )
                .reduce((acc, a) => acc + a, 0)
            }}
            {{ formatUnite(h.type_unite_id) }}
          </th>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
thead {
  position: sticky;
  top: 0;
  z-index: 12;
  background-color: white;
}
</style>
