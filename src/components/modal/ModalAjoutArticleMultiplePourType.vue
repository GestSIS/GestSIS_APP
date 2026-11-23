<script setup>
import { computed, nextTick, ref } from "vue";
import { useNotification } from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { indexedData } from "../../tools/index.js";
import ArticleService from "../../services/materiel/ArticleService";
import SelectEmplacement from "../materiel/SelectEmplacement.vue";
import { useSubmit } from "../../composables/useSubmit.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import permissions from "../../composables/permissions.js";

const { data, callback } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const awn = useNotification();
const { isSubmitting, submit } = useSubmit();
const { showModal, closeModal } = useModalStore();
const peutCreerType = useHasPermission(permissions.MATERIEL.CONFIG);

// Options du traitement d'un écart d'inventaire (pièces d'un lot à ajouter au stock) :
// - lignes : une ligne par pièce à créer (relevé du sapeur), ni ajout ni retrait ;
// - enregistrer(articles, materielTypeId) : remplace la création d'articles ;
// - emplacementId : emplacement proposé ; typePropose : nom d'un type encore à choisir.
const lignesFixes = Array.isArray(data?.lignes);
const typeId = ref(data?.materielTypeId ?? "");

const materielTypeStore = useMaterielTypeStore();
await materielTypeStore.fetchMaterielTypes();

const type = computed(() => materielTypeStore.liste.find((t) => t.id === typeId.value));
const typesProposes = computed(() =>
  materielTypeStore.liste.filter((t) => t.statut && !t.est_emplacement),
);

// Par défaut, tous les articles vont dans un seul emplacement (pas de colonne
// par ligne). En mode « plusieurs emplacements », cet emplacement devient celui
// par défaut : recopié dans chaque nouvelle ligne, modifiable ligne par ligne.
const plusieursEmplacements = ref(false);
const emplacementParDefaut = ref(data?.emplacementId ?? null);
const emplacementDe = (a) =>
  plusieursEmplacements.value ? a.emplacement_id : emplacementParDefaut.value;

// Le compartiment n'a de sens que dans un emplacement compartimenté
const emplacementStore = useEmplacementStore();
const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const compartimentable = (a) => !!indexedEmplacements.value[emplacementDe(a)]?.est_compartimentable;

const nouvelleLigne = (precedente = null) => ({
  emplacement_id: precedente?.emplacement_id ?? emplacementParDefaut.value,
  compartiment: precedente?.compartiment ?? null,
  numero: null,
  est_etiquete: precedente?.est_etiquete ?? false,
  quantite: 1,
  taille: precedente?.taille ?? null,
  date_peremption: precedente?.date_peremption ?? null,
  achat: precedente?.achat ?? null,
  remarque: null,
});

const articles = ref(
  lignesFixes ? data.lignes.map((l) => ({ ...nouvelleLigne(), ...l })) : [nouvelleLigne()],
);

const colonneCompartiment = computed(() => articles.value.some(compartimentable));

// Le type créé revient dans cette fenêtre, déjà choisi, avec la saisie en cours
const creerType = () =>
  showModal({
    component: "ModalMaterielType",
    data: { designation: data?.typePropose ?? "" },
    callback: (nouveau) => {
      if (nouveau?.id) {
        showModal({
          component: "ModalAjoutArticleMultiplePourType",
          data: { ...data, materielTypeId: nouveau.id, lignes: articles.value },
          callback,
        });
      }
    },
  });

const changerEmplacementParDefaut = (emplacementId) => {
  // Les lignes encore sur l'ancien défaut (ou sans emplacement) suivent le nouveau.
  articles.value
    .filter((a) => a.emplacement_id == null || a.emplacement_id === emplacementParDefaut.value)
    .forEach((a) => (a.emplacement_id = emplacementId));
  emplacementParDefaut.value = emplacementId;
};

// Indexé par ligne (l'ordre d'un tableau de refs `v-for` n'est pas garanti).
const numeroInputs = [];
const ajouterLigne = () => {
  articles.value.push(nouvelleLigne(articles.value.at(-1)));
  nextTick(() => numeroInputs[articles.value.length - 1]?.focus());
};

// Saisie au scanner : le « return » envoyé après le code passe à une nouvelle ligne
// (sauf si la suivante existe déjà) au lieu de soumettre le formulaire.
const numeroSuivant = (index) => {
  if (index === articles.value.length - 1) {
    ajouterLigne();
  } else {
    numeroInputs[index + 1]?.focus();
  }
};

const supprimerLigne = (index) => articles.value.splice(index, 1);

const numerosEnDouble = computed(() => {
  const numeros = articles.value.map((a) => a.numero?.trim()).filter(Boolean);
  return new Set(numeros.filter((n, i) => numeros.indexOf(n) !== i));
});

const save = async () => {
  if (articles.value.length === 0) {
    awn.warning("Veuillez ajouter au moins un article");
    return;
  }
  if (!plusieursEmplacements.value && !emplacementParDefaut.value) {
    awn.warning("Veuillez sélectionner un emplacement");
    return;
  }
  if (plusieursEmplacements.value && articles.value.some((a) => !a.emplacement_id)) {
    awn.warning("Veuillez sélectionner un emplacement pour chaque article");
    return;
  }
  if (numerosEnDouble.value.size > 0) {
    awn.warning("Numéro saisi plusieurs fois : " + [...numerosEnDouble.value].join(", "));
    return;
  }

  if (data?.enregistrer) {
    const { ok } = await submit(
      () =>
        data.enregistrer(
          articles.value.map((a) => ({
            emplacement_id: emplacementDe(a),
            compartiment: compartimentable(a) ? a.compartiment : "",
            numero: type.value.est_numerote ? a.numero.trim() : null,
            est_etiquete: a.est_etiquete,
            taille: a.taille,
            date_peremption: a.date_peremption || null,
            achat: a.achat,
            remarque: a.remarque,
          })),
          type.value.id,
        ),
      "Erreur lors de l'ajout du matériel",
    );
    if (ok) {
      callback();
      closeModal();
    }
    return;
  }

  const { ok } = await submit(
    () =>
      ArticleService.creerArticles(
        articles.value.map((a) => ({
          ...a,
          compartiment: compartimentable(a) ? a.compartiment : "",
          materiel_type_id: type.value.id,
          emplacement_id: plusieursEmplacements.value
            ? a.emplacement_id
            : emplacementParDefaut.value,
          sapeur_id: null,
          numero: type.value.est_numerote ? a.numero.trim() : null,
          quantite: type.value.est_numerote ? 1 : Number(a.quantite),
          date_peremption: a.date_peremption || null,
        })),
      ),
    "Erreur lors de l'ajout du matériel",
  );
  if (ok) {
    callback();
    closeModal();
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Ajouter du matériel : {{ type?.designation ?? data.typePropose }}</h5>
      <button aria-label="Fermer" type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div
        v-if="lignesFixes && !data.materielTypeId"
        class="d-flex flex-wrap gap-2 align-items-end mb-2"
      >
        <div class="flex-grow-1">
          <base-select
            v-model="typeId"
            :options="typesProposes"
            label="Type"
            :required="true"
            placeholder="Choisir…"
          />
        </div>
        <button
          v-if="peutCreerType"
          type="button"
          class="btn btn-outline-primary btn-sm"
          @click="creerType"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />
          Créer un nouveau type
        </button>
      </div>
      <p v-if="data.typePropose && !data.materielTypeId" class="small text-body-secondary">
        Type proposé par le sapeur : « {{ data.typePropose }} »
      </p>
      <template v-if="type">
        <select-emplacement
          :model-value="emplacementParDefaut"
          :label="plusieursEmplacements ? 'Emplacement par défaut' : 'Emplacement'"
          :required="!plusieursEmplacements"
          class="mb-2"
          @update:model-value="changerEmplacementParDefaut"
        />
        <div class="form-check form-switch mb-3">
          <input
            id="switch-plusieurs-emplacements"
            v-model="plusieursEmplacements"
            class="form-check-input"
            type="checkbox"
            role="switch"
          />
          <label class="form-check-label" for="switch-plusieurs-emplacements">
            Répartir dans plusieurs emplacements
          </label>
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th v-if="plusieursEmplacements" class="col-3">Emplacement</th>
              <th v-if="colonneCompartiment" class="col-1">Compartiment</th>
              <th v-if="type.est_numerote" class="col-2">Numéro</th>
              <th v-if="type.est_numerote" class="col-1">Est etiqueté</th>
              <th v-else-if="!lignesFixes" class="col-1">Quantité</th>
              <th v-if="type.est_taillee" class="col-1">Taille</th>
              <th v-if="type.est_perimable" class="col-1">Péremption</th>
              <th class="col-1">Achat</th>
              <th>Remarque</th>
              <th v-if="!lignesFixes" class="col-1"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in articles" :key="index">
              <td v-if="plusieursEmplacements">
                <select-emplacement v-model="item.emplacement_id" :required="true" />
              </td>
              <td v-if="colonneCompartiment">
                <input
                  v-model="item.compartiment"
                  class="form-control form-control-sm"
                  type="text"
                  :disabled="!compartimentable(item)"
                  :aria-label="`Compartiment de la ligne ${index + 1}`"
                />
              </td>
              <template v-if="type.est_numerote">
                <td>
                  <input
                    :ref="(el) => (numeroInputs[index] = el)"
                    v-model="item.numero"
                    :required="true"
                    class="form-control form-control-sm"
                    :class="{ 'is-invalid': numerosEnDouble.has(item.numero?.trim()) }"
                    type="text"
                    @keydown.enter.prevent="numeroSuivant(index)"
                  />
                </td>
                <td>
                  <div class="form-check">
                    <input v-model="item.est_etiquete" type="checkbox" class="form-check-input" />
                  </div>
                </td>
              </template>
              <td v-else-if="!lignesFixes">
                <input
                  v-model="item.quantite"
                  :required="true"
                  min="1"
                  max="50"
                  class="form-control form-control-sm"
                  type="number"
                />
              </td>
              <td v-if="type.est_taillee">
                <input v-model="item.taille" class="form-control form-control-sm" type="text" />
              </td>
              <td v-if="type.est_perimable">
                <input
                  v-model="item.date_peremption"
                  :required="true"
                  class="form-control form-control-sm"
                  type="date"
                />
              </td>
              <td>
                <input v-model="item.achat" class="form-control form-control-sm" type="text" />
              </td>
              <td>
                <input v-model="item.remarque" class="form-control form-control-sm" type="text" />
              </td>
              <td v-if="!lignesFixes">
                <button
                  type="button"
                  class="btn btn-outline-danger border-0"
                  title="Supprimer la ligne"
                  @click="supprimerLigne(index)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot v-if="!lignesFixes">
            <tr>
              <td colspan="100" class="text-end">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  title="Ajouter une ligne"
                  @click="ajouterLigne"
                >
                  <font-awesome-icon :icon="['fas', 'plus']" />
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </template>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button :disabled="isSubmitting || !type" type="submit" class="btn btn-primary">
        Ajouter
      </button>
    </div>
  </form>
</template>
