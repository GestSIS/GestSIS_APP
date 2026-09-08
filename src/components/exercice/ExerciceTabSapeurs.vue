<script setup>
import { computed, ref, watchEffect } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useExerciceStore } from "../../stores/exercice/Exercice.js";
import { useExerciceCategorieStore } from "../../stores/exercice/ExerciceCategorie.js";
import { useExcuseTypeStore } from "../../stores/exercice/ExcuseType.js";
import { useHeureExerciceStore } from "../../stores/exercice/HeureExercice.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useModalStore } from "../../stores/common/Modal.js";
import ExerciceService from "../../services/ExerciceService";
import permissions from "/src/composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
import { exerciceStatut } from "../../composables/exerciceStatuts.js";

const sapeurStore = useSapeurStore();
const localiteStore = useLocaliteStore();
const uniteStore = useUniteStore();
const exerciceStore = useExerciceStore();
const exerciceCategorieStore = useExerciceCategorieStore();
const excuseTypeStore = useExcuseTypeStore();
const heureExerciceStore = useHeureExerciceStore();
const exerciceComptableStore = useExerciceComptableStore();

sapeurStore.fetchListeSapeur();
localiteStore.fetchLocalites();
exerciceCategorieStore.fetchExerciceCategories();
exerciceComptableStore.fetchExercicesComptables();
excuseTypeStore.fetchExcuseTypes();
heureExerciceStore.fetchHeuresExercice();
uniteStore.fetchUnites();

const { id } = defineProps({
  id: {
    type: String,
    default: "new",
  },
});

const presences = ref([]);
const dismissedWarning = ref(false);
const allConvoque = ref(false);

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await Promise.all([exerciceStore.fetchExercice(id), exerciceStore.fetchExerciceSapeurs(id)]);
  loading.value = false;
});

const sapeurs = computed(() => sapeurStore.liste);
watchEffect(() => {
  presences.value = exerciceStore.active.sapeurs
    .map((s) => {
      const sapeur = sapeurs.value.find((sap) => sap.id == s.sapeur_id);
      return {
        ...s,
        nom_prenom: sapeur?.nom_prenom ?? "...",
        actif: sapeur?.actif,
      };
    })
    .sort((a, b) => a.nom_prenom.localeCompare(b.nom_prenom));
});

watchEffect(() => {
  const status = presences.value?.map((p) => (p.convoque === 1 ? true : false));
  allConvoque.value = status.length ? status.reduce((c2, c1) => (c1 === c2 ? c1 : "")) : false;
});

const excusesTypes = computed(() => excuseTypeStore.liste);

const hasPresencePermission = useHasPermission(permissions.EXERCICE.PRESENCE);
const hasValidationPermission = useHasPermission(permissions.EXERCICE.VALIDATION);
const activeExerciceData = computed(() => exerciceStore.active.data);
const heureTypes = computed(() => heureExerciceStore.liste);
const unites = computed(() => uniteStore.liste);

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

const statutActuel = computed(() => exerciceStatut(activeExerciceData.value.statut));

// Le bouton Valider n'est utile que pour un exercice en cours de saisie
// (1 = A saisir) ou déjà complet (2 = En attente de validation) : une fois
// annulé, validé ou imputé, il n'y a plus rien à valider.
const showValidateButton = computed(
  () => hasValidationPermission.value && [1, 2].includes(activeExerciceData.value.statut),
);

// Symétrique de "Valider" : permet de revenir en arrière (Validé -> Saisi)
// sans passer par l'annulation complète de l'exercice, pour corriger une
// validation faite par erreur.
const showDevaliderButton = computed(
  () => hasValidationPermission.value && activeExerciceData.value.statut == 3,
);

// Nombre de sapeurs convoqués dont la présence n'est pas encore renseignée :
// tant qu'il en reste, l'exercice reste au statut 1 (le passage à 2, qui
// débloque la validation, est automatique côté backend une fois toutes les
// présences saisies).
const nbConvoques = computed(() => presences.value.filter((p) => p.convoque).length);
const nbConvoquesSansPresence = computed(
  () => presences.value.filter((p) => p.convoque && !p.present && !p.absent && !p.remplace).length,
);

const { confirm, showModal } = useModalStore();
const awn = useNotification();

// Colonnes du tableau : Nom + Convoqué + Présence (fusionne
// Présent/Absent/Remplacé) + Excuse + Statut, puis une colonne par type
// d'heure. `key` sert uniquement de clé de tri/rendu ; les colonnes sans
// valeur correspondante sur la ligne (présence, heures) ne sont pas
// triables (tri neutre), le contenu réel étant fourni par leur slot.
const fields = computed(() => [
  { title: "Nom", key: "nom_prenom" },
  {
    title: "Convoqué",
    key: "convoque",
    slot: "convoque",
    titleClass: "text-center",
    columnClass: "text-center",
  },
  {
    title: "Présence",
    key: "presence",
    slot: "presence",
    titleClass: "text-center",
    columnClass: "text-center",
  },
  {
    title: "Excuse",
    key: "excuse_type_id",
    slot: "excuse",
    titleClass: "text-center",
    columnClass: "text-center",
  },
  {
    title: "Statut",
    key: "excuse_statut",
    slot: "statut",
    titleClass: "text-center",
    columnClass: "text-center",
  },
  ...heureTypes.value.map((h) => ({
    title: h.designation,
    key: "heure_" + h.id,
    slot: heureSlotName(h),
    titleClass: "text-center",
    columnClass: "text-center",
  })),
]);

function heureSlotName(h) {
  return "heure-" + h.id;
}

const selectAllConvoque = (status) => {
  presences.value = presences.value.map((p) => ({
    ...p,
    convoque: status ? 1 : 0,
  }));
  Promise.all(presences.value.map((p) => savePresence(p, true))).then(
    awn.success("Modifications enregistrées"),
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

    exerciceStore
      .addHeure(newHeure)
      .then(() => awn.success("Heure ajoutée"))
      .catch((err) => awn.alert(err?.message || "Erreur lors de l'enregistrement"));
  } else if (!(parseFloat(quantite) || null)) {
    // Suppression de l'heure
    exerciceStore
      .removeHeure(heure)
      .then(() => awn.success("Heure supprimée"))
      .catch((err) => awn.alert(err?.message || "Erreur lors de l'enregistrement"));
  } else {
    heure.quantite = parseFloat(quantite) || null;
    // Modification de l'heure
    exerciceStore
      .editHeure(heure)
      .then(() => awn.success("Modifications enregistrées"))
      .catch((err) => awn.alert(err?.message || "Erreur lors de l'enregistrement"));
  }
};
const validate = () => {
  confirm(
    "Valider l'exercice ?",
    "Une fois validé, les présences ne seront plus modifiables sans permission de validation. Voulez-vous continuer ?",
  ).then(() =>
    exerciceStore
      .validerExercice(id)
      .then((res) => awn.success(res?.message || "Exercice validé avec succès."))
      .catch((err) => awn.alert(err?.message || "Erreur lors de la validation de l'exercice.")),
  );
};
const devalider = () => {
  confirm(
    "Annuler la validation ?",
    `L'exercice repassera au statut « ${exerciceStatut(2).label} » et redeviendra modifiable. Voulez-vous continuer ?`,
  ).then(() =>
    exerciceStore
      .devaliderExercice(id)
      .then(() => awn.success("Validation annulée."))
      .catch((err) => awn.alert(err?.message || "Erreur lors de l'annulation de la validation.")),
  );
};
const formatUnite = (type_unite_id) => {
  return unites.value.find((u) => u.id == type_unite_id)?.abreviation;
};
const totalHeure = (rows, h) =>
  rows
    .map((s) => parseFloat(s.heures.find((e) => e.heure_exercice_type_id == h.id)?.quantite ?? 0))
    .reduce((acc, a) => acc + a, 0);
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
        exerciceStore
          .addSapeurs(newSapeurs)
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
        exerciceStore
          .removeSapeurs(supprime)
          .then(resolve)
          .catch(() => {
            reject("Erreur lors de l'opération");
          });
      }

      if (newSapeurs.length <= 0 && supprime.length <= 0) {
        resolve("Solved");
      }
    });
  };
  showModal({
    component: "ModalSapeurSelect",
    size: 1,
    callback,
    data: { ids: presences.value.map((s) => s.sapeur_id) },
  });
};
const savePresence = async (sapeur, hideNotification) => {
  const promise = exerciceStore.editPresenceExercice(sapeur.id, sapeur);
  if (!hideNotification) {
    try {
      const res = await promise;
      return awn.success(res?.message || "Modifications enregistrées");
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
  sapeur.present = 1;
  sapeur.remplace = 0;
  sapeur.absent = 0;
  sapeur.excuse_statut = 0;
  savePresence(sapeur);
};
const selectAbsent = (sapeur) => {
  sapeur.absent = 1;
  sapeur.remplace = 0;
  sapeur.present = 0;
  savePresence(sapeur);
};
const selectRemplace = (sapeur) => {
  sapeur.remplace = 1;
  sapeur.present = 0;
  sapeur.absent = 0;
  sapeur.excuse_statut = 0;
  savePresence(sapeur);
};

// Statut dérivé des 3 booléens, pour le groupe de boutons "Présence".
const presenceStatut = (sap) => (sap.present ? 1 : sap.absent ? 2 : sap.remplace ? 3 : undefined);
const presenceOptions = (sap) => [
  { value: 1, label: "Présent", color: "success", disabled: !canEditPresence.value },
  { value: 2, label: "Absent", color: "danger", disabled: !canEditPresence.value },
  {
    value: 3,
    label: "Remplacé",
    color: "warning",
    disabled: !canEditAbsence.value || (!canEditPresence.value && !!sap.present),
  },
];
const selectPresenceStatut = (sap, statut) => {
  if (statut === 1) selectPresent(sap);
  else if (statut === 2) selectAbsent(sap);
  else if (statut === 3) selectRemplace(sap);
};

const detailExcuse = (sapeur) => {
  if (!hasPresencePermission.value) {
    awn.warning("Permissions insuffisantes pour accéder au détails de l'excuse");
    return;
  }
  showModal({
    component: "ModalExcuse",
    data: sapeur,
    callback: async (presence) => {
      if (presence !== null && presence !== undefined) {
        presence.present = 0;
        presence.remplace = 0;
        await savePresence(presence);
        presences.value = presences.value.map((p) =>
          parseInt(p.id) == parseInt(presence.id) ? presence : p,
        );
      }
    },
  });
};
const addExcuse = (sapeur) =>
  showModal({
    component: "ModalExcuse",
    data: sapeur,
    callback: async (presence) => {
      if (presence !== null && presence !== undefined) {
        presence.present = 0;
        presence.absent = 1;
        presence.remplace = 0;
        await savePresence(presence);
        presences.value = presences.value.map((p) =>
          parseInt(p.id) == parseInt(presence.id) ? presence : p,
        );
      }
    },
  });

const removeExcuse = (presence) =>
  confirm(
    "Voulez-vous vraiment supprimer cette excuse ?",
    "Attention, la suppression d'une excuse est irréversible ! Toutes les données relatives à celle-ci seront supprimées définitivement.",
  ).then(() => exerciceStore.removeExcuse(presence.exercice_id, presence.sapeur_id));

const downloadJustificatif = (sapeur) => {
  if (!hasPresencePermission.value) {
    awn.warning("Permissions insuffisantes pour accéder au détails de l'excuse");
    return;
  }
  ExerciceService.downloadExcuseJustificatif(
    sapeur.exercice_id,
    sapeur.sapeur_id,
    "justificatif_" + sapeur.justificatif_filename,
  ).catch((err) => awn.alert(err?.message ?? "Erreur lors du chargement du justificatif"));
};

const statuts = [
  { id: -2, designation: "Amendée" },
  { id: -1, designation: "Refusée" },
  { id: 0, designation: "A traiter" },
  { id: 1, designation: "Acceptée" },
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
    Exercice déjà imputé, uniquement possible de modifier le type d'absence et la mise à l'amende.
  </div>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex flex-wrap align-items-center gap-2">
      <!-- Actions sur la liste des sapeurs -->
      <button
        v-if="hasPresencePermission"
        class="btn btn-outline-primary"
        :disabled="!canEditPresence"
        @click="manageSapeurs"
      >
        Gérer la liste des sapeurs
      </button>
      <base-checkbox
        v-if="hasPresencePermission"
        class="mb-0"
        label="Tout convoquer"
        :model-value="allConvoque"
        :disabled="!canEditPresence"
        @update:model-value="selectAllConvoque"
      />

      <!-- État de l'exercice + action pour le faire avancer, regroupés -->
      <div class="ms-md-auto d-flex flex-wrap align-items-center gap-2">
        <span class="badge rounded-pill" :class="statutActuel.badgeClass">
          {{ statutActuel.label }}
        </span>
        <span v-if="activeExerciceData.statut == 1 && nbConvoques > 0" class="text-muted small">
          {{ nbConvoques - nbConvoquesSansPresence }}/{{ nbConvoques }} présences saisies
        </span>
        <button
          v-if="showValidateButton"
          class="btn"
          :class="canValidate ? 'btn-primary' : 'btn-outline-primary'"
          :disabled="!canValidate"
          :title="
            canValidate
              ? 'Valider cet exercice'
              : `Encore ${nbConvoquesSansPresence} sapeur(s) convoqué(s) sans présence renseignée`
          "
          @click="validate"
        >
          <font-awesome-icon :icon="['fas', 'check']" class="me-1" />
          Valider
        </button>
        <button
          v-if="showDevaliderButton"
          class="btn btn-outline-warning"
          title="Repasser l'exercice en attente de validation"
          @click="devalider"
        >
          <font-awesome-icon :icon="['fas', 'rotate-left']" class="me-1" />
          Annuler la validation
        </button>
      </div>
    </div>
    <div class="card-body table-responsive p-0">
      <base-table
        class="tableau-presences"
        :loading="loading"
        :fields="fields"
        :data="presences"
        :row-class="(row) => (!row.actif ? 'table-danger' : '')"
        no-data="Aucun sapeur"
        hide-download
      >
        <template #convoque="{ rowData: sap }">
          <!-- base-checkbox enveloppe l'input dans un <div class="form-check">
               (bloc, positionnement flottant Bootstrap) : contrairement à un
               <input> brut, `text-align: center` sur le <td> ne le centre pas.
               Un conteneur flex le fait explicitement. -->
          <div class="d-flex justify-content-center">
            <base-checkbox
              :model-value="sap.convoque"
              :true-value="1"
              :false-value="0"
              :disabled="!canEditPresence"
              @update:model-value="
                (val) => {
                  sap.convoque = val;
                  selectConvoque(sap);
                }
              "
            />
          </div>
        </template>

        <template #presence="{ rowData: sap }">
          <base-radio
            button-style
            size="sm"
            :options="presenceOptions(sap)"
            :model-value="presenceStatut(sap)"
            @update:model-value="(statut) => selectPresenceStatut(sap, statut)"
          />
        </template>

        <template #excuse="{ rowData: sap }">
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
            >{{ excusesTypes.find((e) => e.id == sap.excuse_type_id)?.designation }}</span
          >
          <button v-if="sap.justificatif_path" class="btn" @click="downloadJustificatif(sap)">
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
        </template>

        <template #statut="{ rowData: sap }">
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
            >{{ statuts.find((s) => s.id == sap.excuse_statut)?.designation }}</span
          ><span v-else></span>
        </template>

        <template v-for="h in heureTypes" :key="h.id" #[heureSlotName(h)]="{ rowData: sap }">
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
                      (!e.heure_exercice_type_id && e.designation == h.designation),
                  ),
                )
              "
              @change="(e) => updateHeureSapeur(sap, h, e.target.value)"
            />
            <span class="input-group-text">{{ formatUnite(h.type_unite_id) }}</span>
          </div>
        </template>

        <template #foot="{ data }">
          <tr>
            <th>Nb sapeurs : {{ data.length }}</th>
            <th class="text-center">{{ data.filter((s) => s.convoque).length }}</th>
            <th class="text-center presence-totaux">
              <span class="text-success">{{ data.filter((s) => s.present).length }} présents</span>
              <span class="text-danger">{{ data.filter((s) => s.absent).length }} absents</span>
              <span class="text-warning"
                >{{ data.filter((s) => s.remplace).length }} remplacés</span
              >
            </th>
            <th class="text-center">{{ data.filter((s) => s.excuse_type_id).length }} excusé(s)</th>
            <th class="text-center">{{ data.filter((s) => s.amende).length }} amende(s)</th>
            <th v-for="h in heureTypes" :key="h.id" class="text-center">
              {{ totalHeure(data, h) }} {{ formatUnite(h.type_unite_id) }}
            </th>
          </tr>
        </template>
      </base-table>
    </div>
  </div>
</template>

<style scoped>
.tableau-presences :deep(thead) {
  position: sticky;
  top: 0;
  z-index: 12;
  background-color: var(--bs-table-bg);
}

.presence-totaux {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}
</style>
