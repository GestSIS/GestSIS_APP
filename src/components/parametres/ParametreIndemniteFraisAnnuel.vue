<script setup>
import { computed, ref } from "vue";
import { useImputationStore } from "../../stores/comptabilite/Imputation.js";
import { useCompteStore } from "../../stores/comptabilite/Compte.js";
import { useEcritureCategorieStore } from "../../stores/comptabilite/EcritureCategorie.js";
import { useFonctionStore } from "../../stores/sapeur/Fonction.js";
import { useUniteStore } from "../../stores/common/Unite.js";
import { useModalStore } from "../../stores/common/Modal.js";

const imputationStore = useImputationStore();
const compteStore = useCompteStore();
const ecritureCategorieStore = useEcritureCategorieStore();
const fonctionStore = useFonctionStore();
const uniteStore = useUniteStore();

const loadIndemnites = imputationStore.fetchFraisIndemnitesTypes();
const loadFonctions = fonctionStore.fetchFonctions();
const loadComptes = compteStore.fetchComptes();
const loadUnites = uniteStore.fetchUnites();

await Promise.all([loadIndemnites, loadFonctions, loadComptes, loadUnites]);

const detailsTypes = ref(false);
const fonctions = computed(() => {
  const fonctionIds = new Set(
    imputationStore.fraisIndemnites.annuels.flatMap((t) =>
      t.frais_indemnite_annuels.map((f) => f.fonction_id),
    ),
  );
  return fonctionStore.liste
    .filter((f) => f.actif || fonctionIds.has(f.id))
    .slice(0)
    .sort((a, b) => b.tri - a.tri);
});
const comptes = computed(() => compteStore.liste);
const unites = computed(() => uniteStore.liste);
const categories = computed(() => ecritureCategorieStore.liste);

const formatType = (type) => {
  const mapping = {
    0: "Autre",
    1: "Solde",
    2: "Indemnité",
    3: "Frais forfaitaire",
    4: "Frais effectif",
    5: "Charges AVS/AC",
  };
  return mapping[type] || "";
};

const typesAnnuel = computed(() =>
  imputationStore.fraisIndemnites.annuels.map((f) => {
    const compte = comptes.value.find((c) => c.id === f.compte_id);
    return {
      ...f,
      fonctions: f.frais_indemnite_annuels || [],
      ecriture_categorie: f.id
        ? categories.value.find((c) => c.id === f.ecriture_categorie_id)?.designation
        : "",
      compte: !f.id ? "" : `${compte?.numero} ${compte?.designation}`,
      formatted_type: formatType(f.type),
    };
  }),
);

const { confirm, showModal } = useModalStore();
const montantAnnuelTypePourFonction = (type, fonction) => {
  const elem = type.fonctions?.find((e) => e.fonction_id == fonction.id);
  return elem?.quantite * elem?.montant || "";
};
const montantAnnuelTypePourFonctionDetails = (type, fonction) => {
  const elem = type.fonctions?.find((e) => e.fonction_id == fonction.id);
  if (!elem) {
    return "";
  }
  const _ = (value) => {
    const numericalValue = Number.parseFloat(value);
    return Number.isInteger(numericalValue) ? parseInt(numericalValue) : numericalValue;
  };
  const formattedUnite = elem?.type_unite_id
    ? unites.value.find((u) => u.id === elem?.type_unite_id)?.abreviation
    : "";

  return `${_(elem?.quantite)} x ${_(elem?.montant)} ${formattedUnite}`;
};

const ajoutType = () => showModal({ component: "ModalIndemniteFraisAnnuelType", data: {} });
const updateType = (type) =>
  showModal({
    component: "ModalIndemniteFraisAnnuelType",
    data: { ...type },
  });
const deleteType = (type) => {
  const description = type.type == "frais" ? "ce frais type" : "cette indemnité type";
  confirm(
    `Voulez-vous vraiment supprimer ${description} ?`,
    "Attention, cette action est irréversible ! Les frais/indemnités générés avec ce type ne seront cependant pas affecté.",
  ).then(() => imputationStore.removeFraisIndemniteAnnuelType(type.id));
};

const addFonction = (type, fonction) => {
  const elem = type?.frais_indemnite_annuels.find((e) => e.fonction_id == fonction.id);
  showModal({
    component: "ModalIndemniteFraisAnnuel",
    data: {
      fonction_id: fonction.id,
      frais_indemnite_annuel_type_id: type.id,
      type: type.type,
      ...elem,
    },
  });
};
const updateFonction = (type, fonction) => {
  const elem = type.frais_indemnite_annuels.find((e) => e.fonction_id == fonction.id);
  showModal({
    component: "ModalIndemniteFraisAnnuel",
    data: {
      fonction_id: fonction.id,
      frais_indemnite_annuel_type_id: type.frais_indemnite_annuel_type_id,
      type: type.type,
      ...elem,
    },
  });
};
const deleteFonction = (type, fonction) => {
  const elem = type.fonctions.find((e) => e.fonction_id == fonction.id);
  const description = type.type == "frais" ? "ce frais" : "cette indemnité";
  confirm(
    `Voulez-vous vraiment supprimer ${description} ?`,
    "Attention, cette action est irréversible ! Les frais/indemnités générés avec ce type ne seront cependant pas affecté.",
  ).then(() => imputationStore.removeFraisIndemniteAnnuel(elem.id));
};
</script>

<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title">Frais &amp; indemnités annuels</h3>
      <div class="form-check form-switch mb-2">
        <input id="switch" v-model="detailsTypes" type="checkbox" class="form-check-input" />
        <label class="form-check-label" for="switch">Afficher les détails</label>
      </div>
    </div>
    <div class="card-body table-responsive p-0">
      <table id="frais-annuels" class="table table-sm">
        <thead>
          <tr>
            <th></th>
            <th v-for="type in typesAnnuel" :key="type.id + '-' + type.type" class="text-center">
              {{ type.designation }}
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateType(type)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteType(type)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </th>
            <th rowspan="4" class="text-center align-middle">
              <button type="button" class="btn btn-outline-primary border-0" @click="ajoutType()">
                <font-awesome-icon size="2x" :icon="['far', 'plus-square']" />
              </button>
            </th>
          </tr>
          <tr>
            <th>Compte</th>
            <td v-for="type in typesAnnuel" :key="type.id" class="text-center">
              {{ type.compte }}
            </td>
          </tr>
          <tr>
            <th>Catégorie comptable</th>
            <td v-for="type in typesAnnuel" :key="type.id" class="text-center">
              {{ type.ecriture_categorie }}
            </td>
          </tr>
          <tr>
            <th>Type</th>
            <td v-for="type in typesAnnuel" :key="type.id" class="text-center">
              {{ type.formatted_type }}
            </td>
          </tr>
          <tr>
            <th>Cumulable</th>
            <td v-for="type in typesAnnuel" :key="type.id" class="text-center">
              <input type="checkbox" class="form-check-input" :checked="type.cumulable" disabled />
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="fonction in fonctions" :key="fonction.id">
            <td :class="{ 'text-danger': !fonction.actif }">
              <font-awesome-icon
                v-if="!fonction.actif"
                v-tooltip.bottom="
                  'Fonction inactive, vous devriez supprimer les frais et indemnités pour cette fonction.'
                "
                :icon="['fas', 'info-circle']"
              />&nbsp;{{ fonction.nom }}
            </td>
            <td v-for="type in typesAnnuel" :key="type.id + '-' + type.type" class="text-end">
              <template v-if="!detailsTypes">{{
                montantAnnuelTypePourFonction(type, fonction)
              }}</template>
              <template v-if="detailsTypes">{{
                montantAnnuelTypePourFonctionDetails(type, fonction)
              }}</template>
              <button
                v-if="!type.fonctions.find((f) => f.fonction_id == fonction.id)"
                type="button"
                class="btn btn-outline-primary border-0"
                @click="addFonction(type, fonction)"
              >
                <font-awesome-icon :icon="['far', 'plus-square']" />
              </button>
              <button
                v-if="type.fonctions.find((f) => f.fonction_id == fonction.id)"
                type="button"
                class="btn btn-outline-primary border-0"
                @click="updateFonction(type, fonction)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                v-if="type.fonctions.find((f) => f.fonction_id == fonction.id)"
                type="button"
                class="btn btn-outline-danger border-0"
                @click="deleteFonction(type, fonction)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
