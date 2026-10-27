<script setup>
import { computed, nextTick, reactive, ref, useTemplateRef, watch } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useSapeurStore } from "../../stores/sapeur/Sapeur.js";
import { useExerciceComptableStore } from "../../stores/comptabilite/ExerciceComptable.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useTravailTypeStore } from "../../stores/travail/TravailType.js";
import { useAuthStore } from "../../stores/auth/Auth.js";

import permissions from "../../composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
import { useTravailStore } from "../../stores/travail/Travail.js";
import TravailService from "../../services/TravailService.js";

const { callback, data } = defineProps({
  callback: {
    type: Function,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => {},
  },
});

const authStore = useAuthStore();
const sapeurStore = useSapeurStore();
const exerciceComptableStore = useExerciceComptableStore();
const uniteStore = useUniteStore();
const travailStore = useTravailStore();
const travailTypeStore = useTravailTypeStore();

// Ouverte depuis une intervention ou un exercice (lienVerrouille) : la fiche y est liée et
// l'exercice comptable est le sien. Sinon, le lien se choisit parmi les événements accessibles.
const { intervention = null, exercice = null, lienVerrouille = false, ...donnees } = data ?? {};
const interventionLiee = lienVerrouille ? intervention : null;
const exerciceLie = lienVerrouille ? exercice : null;
const lienFixe = interventionLiee ?? exerciceLie;

const errors = ref({});
const form = reactive({
  exercice_comptable_id: lienFixe?.exercice_comptable_id ?? exerciceComptableStore.activeId,
  intervention_id: interventionLiee?.id ?? null,
  exercice_id: exerciceLie?.id ?? null,
  sapeurs: [
    {
      sapeur_id: donnees.sapeur_id ?? authStore.sapeurId,
      quantite: donnees.quantite,
    },
  ],
  ...donnees,
});

const libelleIntervention = (i) =>
  new Date(i.date_debut).toLocaleDateString("fr-CH") + " - " + i.objet;
const libelleExercice = (e) => new Date(e.date).toLocaleDateString("fr-CH") + " - " + e.designation;
const lienFixeLibelle = interventionLiee
  ? libelleIntervention(interventionLiee)
  : exerciceLie
    ? libelleExercice(exerciceLie)
    : "";

const unites = computed(() => uniteStore.liste);
// Lien verrouillé : seuls les types liables à ce genre d'événement
const travailTypes = computed(() =>
  travailTypeStore.liste.filter(
    (t) =>
      t.id === form.travail_type_id ||
      (t.actif && (interventionLiee ? t.lien_intervention : exerciceLie ? t.lien_exercice : true)),
  ),
);
const typeActif = computed(() => travailTypeStore.liste.find((t) => t.id === form.travail_type_id));

// Statuts « validé » des événements (InterventionBusiness / ExerciceBusiness)
const INTERVENTION_VALIDEE = 2;
const EXERCICE_VALIDE = 3;
const hasValidationIntervention = useHasPermission(permissions.INTERVENTION.VALIDATION);
const hasValidationExercice = useHasPermission(permissions.EXERCICE.VALIDATION);

const evenements = ref({ interventions: [], exercices: [] });
if (!lienFixe) {
  TravailService.getEvenements(form.exercice_comptable_id)
    .then((res) => (evenements.value = res))
    .catch(() => awn.alert("Erreur lors du chargement des interventions et exercices"));
}

const dateFr = (d) => new Date(d).toLocaleDateString("fr-CH");
const optionsIntervention = computed(() => {
  const options = evenements.value.interventions.map((i) => ({
    value: "intervention:" + i.id,
    libelle: dateFr(i.date_debut) + " - " + i.objet,
    valide: i.statut === INTERVENTION_VALIDEE,
  }));
  // Fiche déjà liée à une intervention absente de la liste : on garde son lien affiché
  if (
    form.intervention_id &&
    !options.some((o) => o.value === "intervention:" + form.intervention_id)
  ) {
    options.unshift({
      value: "intervention:" + form.intervention_id,
      libelle: intervention
        ? dateFr(intervention.date_debut) + " - " + intervention.objet
        : "Intervention n° " + form.intervention_id,
      valide: intervention?.statut === INTERVENTION_VALIDEE,
    });
  }
  return options;
});
const optionsExercice = computed(() => {
  const options = evenements.value.exercices.map((e) => ({
    value: "exercice:" + e.id,
    libelle: dateFr(e.date) + " - " + e.designation,
    valide: e.statut === EXERCICE_VALIDE,
  }));
  if (form.exercice_id && !options.some((o) => o.value === "exercice:" + form.exercice_id)) {
    options.unshift({
      value: "exercice:" + form.exercice_id,
      libelle: exercice ? libelleExercice(exercice) : "Exercice n° " + form.exercice_id,
      valide: exercice?.statut === EXERCICE_VALIDE,
    });
  }
  return options;
});

const lien = computed({
  get: () =>
    form.intervention_id
      ? "intervention:" + form.intervention_id
      : form.exercice_id
        ? "exercice:" + form.exercice_id
        : "",
  set: (valeur) => {
    const [genre, id] = valeur ? valeur.split(":") : [null, null];
    form.intervention_id = genre === "intervention" ? parseInt(id) : null;
    form.exercice_id = genre === "exercice" ? parseInt(id) : null;
  },
});

// Un changement de type retire un lien que le nouveau type n'autorise pas
watch(typeActif, (type) => {
  if (lienFixe) return;
  if (form.intervention_id && !type?.lien_intervention) form.intervention_id = null;
  if (form.exercice_id && !type?.lien_exercice) form.exercice_id = null;
});

const evenementChoisi = computed(() =>
  [...optionsIntervention.value, ...optionsExercice.value].find((o) => o.value === lien.value),
);
// Événement déjà validé : seul son validateur peut y ajouter une fiche, alors directement acceptée
const droitSurEvenementValide = computed(() =>
  form.intervention_id ? hasValidationIntervention.value : hasValidationExercice.value,
);
const evenementValideRefuse = computed(
  () => !lienFixe && evenementChoisi.value?.valide && !droitSurEvenementValide.value,
);
const evenementValideAccepte = computed(
  () => !lienFixe && evenementChoisi.value?.valide && droitSurEvenementValide.value,
);
const libelleEvenement = computed(() =>
  form.intervention_id ? "Cette intervention" : "Cet exercice",
);
const droitEvenement = computed(() =>
  form.intervention_id ? "la validation des interventions" : "la validation des exercices",
);
const sapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));
const hasSaisieCommunePermission = useHasPermission(permissions.FICHE_TRAVAIL.SAISIE_COMMUNE);

const activeUnite = computed(() =>
  unites.value.find(
    (u) => u.id === travailTypes.value.find((t) => t.id === form.travail_type_id)?.type_unite_id,
  ),
);

const { closeModal } = useModalStore();
const awn = useNotification();

const sapeurSelecteurInputs = useTemplateRef(`sapeur-selecteur`);
const ajoutType = () => {
  form.sapeurs.push({
    sapeur_id: null,
    quantite: null,
  });

  nextTick(() => {
    sapeurSelecteurInputs.value[sapeurSelecteurInputs.value.length - 1].focus();
  });
};
const supprimerType = (i) => {
  form.sapeurs.splice(i, 1);
};
const save = async () => {
  errors.value = {};

  if (evenementValideRefuse.value) {
    return;
  }

  // Contrôle qu'aucune colonne n'est dupliquée
  const sapeurIds = new Set(form.sapeurs.map((e) => e.sapeur_id));
  if (sapeurIds.size != form.sapeurs.length) {
    awn.alert("Erreur, un sapeur a été saisie à double.");
    return;
  }

  // Return en cas d'erreurs
  if (Object.keys(errors.value).length > 0) {
    return;
  }

  if (!activeUnite.value?.comptable) {
    form.sapeurs = form.sapeurs.map((s) => ({
      ...s,
      quantite: 1,
    }));
  }

  let promise = null;
  if ((form.id ?? 0) === 0) {
    const travaux = form.sapeurs.map((s) => ({
      ...form,
      sapeurs: undefined,
      ...s,
    }));
    promise = travailStore.addTravaux(travaux);
  } else {
    if (!form.sapeurs[0]) return;
    const travail = {
      ...form,
      sapeur_id: form.sapeurs[0].sapeur_id,
      quantite: form.sapeurs[0].quantite,
    };
    promise = travailStore.updateTravail(travail);
  }
  promise
    .then(() => {
      callback(true);
      closeModal();
    })
    .catch((err) => {
      errors.value = err.errors ?? {};
      awn.alert(err?.message ?? "Erreur lors de l'enregistrement");
    });
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un travail</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div v-if="lienFixe" class="mb-3">
        <label for="lien-fixe">{{ interventionLiee ? "Intervention" : "Exercice" }}</label>
        <input
          id="lien-fixe"
          :value="lienFixeLibelle"
          type="text"
          class="form-control form-control-sm"
          disabled
        />
      </div>
      <base-select
        v-model="form.travail_type_id"
        :required="true"
        class="mb-3"
        :class="{ 'is-invalid': errors['travail_type_id'] }"
        :options="travailTypes"
        label="Travail"
      />
      <div
        v-if="!lienFixe && (typeActif?.lien_intervention || typeActif?.lien_exercice)"
        class="mb-3"
      >
        <label for="lien">Lié à</label>
        <select
          id="lien"
          v-model="lien"
          class="form-select form-select-sm"
          :required="typeActif?.lien_obligatoire"
        >
          <option v-if="!typeActif?.lien_obligatoire" value="">Aucun</option>
          <option v-else value="" disabled>Choisir un événement</option>
          <optgroup v-if="typeActif?.lien_intervention" label="Interventions">
            <option v-for="o in optionsIntervention" :key="o.value" :value="o.value">
              {{ o.libelle }}{{ o.valide ? " (validée)" : "" }}
            </option>
          </optgroup>
          <optgroup v-if="typeActif?.lien_exercice" label="Exercices">
            <option v-for="o in optionsExercice" :key="o.value" :value="o.value">
              {{ o.libelle }}{{ o.valide ? " (validé)" : "" }}
            </option>
          </optgroup>
        </select>
        <div v-if="evenementValideRefuse" class="alert alert-danger py-2 mt-2 mb-0">
          {{ libelleEvenement }} est déjà validé{{ form.intervention_id ? "e" : "" }} : seule une
          personne disposant de {{ droitEvenement }} peut y ajouter une fiche.
        </div>
        <div v-else-if="evenementValideAccepte" class="alert alert-info py-2 mt-2 mb-0">
          {{ libelleEvenement }} est déjà validé{{ form.intervention_id ? "e" : "" }} : la fiche
          sera directement acceptée.
        </div>
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="form.designation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="date">Date</label>
        <input
          id="date"
          v-model="form.date"
          required
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['date'] }"
        />
      </div>
      <base-select
        v-if="form?.id && hasSaisieCommunePermission"
        v-model="form.sapeurs[0].sapeur_id"
        :required="true"
        class="mb-3"
        label="Sapeur"
        display-key="nom_prenom"
        :options="sapeurs"
      />
      <label v-if="form?.id || !hasSaisieCommunePermission" for="quantite">Quantité</label>
      <div v-if="form?.id || !hasSaisieCommunePermission" class="input-group input-group-sm mb-3">
        <input
          id="quantite"
          v-model="form.sapeurs[0].quantite"
          required
          name="quantite"
          type="number"
          min="0"
          step=".01"
          class="form-control form-control-sm"
        />
        <span class="input-group-text">
          {{
            unites.find(
              (u) => u.id == travailTypes.find((t) => t.id == form.travail_type_id)?.type_unite_id,
            )?.unite
          }}</span
        >
      </div>
      <div v-if="!form?.id && hasSaisieCommunePermission" class="mb-3">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Sapeur</th>
              <th>Quantité</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in form.sapeurs" :key="i">
              <td class="col-8">
                <base-select
                  ref="sapeur-selecteur"
                  v-model="item.sapeur_id"
                  :required="true"
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
                    required
                    type="number"
                    min="0"
                    step=".01"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['base-quantite' + i] }"
                  />
                  <input
                    v-if="!activeUnite?.comptable"
                    :value="1"
                    required
                    type="number"
                    :disabled="true"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': errors['base-quantite' + i] }"
                  />
                  <span class="input-group-text"> {{ activeUnite?.unite }}</span>
                </div>
              </td>
              <td class="text-center">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  :disabled="form.sapeurs.length <= 1"
                  @click="supprimerType(i)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="3">
                <button type="button" class="btn btn-outline-primary" @click="ajoutType()">
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
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary" :disabled="evenementValideRefuse">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
