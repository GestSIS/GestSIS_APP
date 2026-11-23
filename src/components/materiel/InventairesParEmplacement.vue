<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useInventaireStore } from "../../stores/materiel/Inventaire";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useModalStore } from "../../stores/common/Modal";
import { useHasPermission } from "../../composables/useHasPermission.js";
import permissions from "../../composables/permissions.js";
import { groupedByData, indexedData } from "../../tools/index.js";
import { formatDate } from "../../tools/formatters.js";
import { etapeEmplacement, iconeEtape } from "../../tools/materiel.js";
import { ancetresEtSoi, emplacementInventorie } from "../../tools/inventaire.js";
import TagCouleur from "./TagCouleur.vue";

// Arbre des emplacements actifs avec leur dernier inventaire ; l'emplacement choisi (dans
// l'URL) filtre l'historique.
const { selectionId } = defineProps({
  selectionId: {
    type: Number,
    default: null,
  },
});

const router = useRouter();
const inventaireStore = useInventaireStore();
const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();
const { showModal } = useModalStore();
const hasInventairePermission = useHasPermission(permissions.MATERIEL.INVENTAIRE);

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const arbre = computed(() => {
  const parParent = groupedByData(
    emplacementStore.liste.filter((e) => e.statut),
    "parent_id",
  );
  const parcourir = (parentId, niveau) =>
    [...(parParent[parentId] ?? [])]
      .sort((a, b) => a.tri - b.tri)
      .flatMap((e) => [{ ...e, niveau }, ...parcourir(e.id, niveau + 1)]);
  return parcourir(null, 0);
});

// Tout est replié au départ, sauf le premier niveau.
const replies = ref(new Set(arbre.value.filter((e) => e.niveau > 0).map((e) => e.id)));
const basculer = (id) => (replies.value.has(id) ? replies.value.delete(id) : replies.value.add(id));

const computedData = computed(() => {
  const parents = new Set(arbre.value.map((e) => e.parent_id));
  // Un inventaire couvre l'emplacement s'il porte sur lui ou sur un de ses parents
  const couvre = (inventaire, ancetres) => ancetres.includes(emplacementInventorie(inventaire));
  const lignes = arbre.value
    .filter((e) =>
      ancetresEtSoi(e.parent_id, indexedEmplacements.value).every((id) => !replies.value.has(id)),
    )
    .map((e) => {
      const ancetres = ancetresEtSoi(e.id, indexedEmplacements.value);
      const dernier = inventaireStore.valides.find((i) => couvre(i, ancetres)) ?? null;
      return {
        ...e,
        aDesEnfants: parents.has(e.id),
        enCours: inventaireStore.enCours.some((i) => couvre(i, ancetres)),
        dernier,
        via: dernier && emplacementInventorie(dernier) !== e.id ? dernier.racine.designation : "",
      };
    });
  return { lignes, plusieursNiveaux: arbre.value.some((e) => e.niveau > 0) };
});

const choisir = (id) =>
  router.push({ name: "materiel-inventaires", params: { emplacementId: id } });
const demarrer = (emplacementId) =>
  showModal({ component: "ModalDemarrerInventaire", data: { emplacementId } });
</script>

<template>
  <base-card title="État par emplacement">
    <template #body>
      <div class="d-flex small fw-semibold text-body-secondary pb-1">
        <span
          class="flex-grow-1 px-2"
          :style="{ marginLeft: computedData.plusieursNiveaux ? '31px' : 0 }"
          >Emplacement</span
        >
        <span class="text-end px-2" style="min-width: 140px">Dernier inventaire</span>
        <span v-if="hasInventairePermission" class="text-center" style="width: 64px">
          Actions
        </span>
      </div>
      <ul class="list-unstyled mb-0">
        <li
          v-for="emplacement in computedData.lignes"
          :key="emplacement.id"
          class="d-flex align-items-center border-top"
          :style="{ paddingLeft: `${emplacement.niveau * 20}px` }"
        >
          <button
            v-if="emplacement.aDesEnfants"
            type="button"
            class="btn btn-sm border-0"
            :aria-label="
              (replies.has(emplacement.id) ? 'Déplier ' : 'Replier ') + emplacement.designation
            "
            :aria-expanded="!replies.has(emplacement.id)"
            @click="basculer(emplacement.id)"
          >
            <font-awesome-icon
              :icon="['fas', replies.has(emplacement.id) ? 'angle-right' : 'angle-down']"
            />
          </button>
          <span
            v-else-if="computedData.plusieursNiveaux"
            class="d-inline-block"
            style="width: 31px"
          ></span>
          <button
            type="button"
            class="btn btn-sm flex-grow-1 d-flex align-items-center gap-2 text-start border-0"
            :class="{ 'bg-primary-subtle': selectionId === emplacement.id }"
            :aria-pressed="selectionId === emplacement.id"
            @click="choisir(emplacement.id)"
          >
            <span class="flex-grow-1">
              <tag-couleur
                :couleur="indexedCouleurs[emplacement.couleur_id]"
                :icone="iconeEtape(etapeEmplacement(emplacement))"
              >
                {{ emplacement.designation }}
              </tag-couleur>
              <span v-if="emplacement.enCours" class="badge text-bg-info ms-1">En cours</span>
            </span>
            <span class="small text-end" style="min-width: 140px">
              <template v-if="emplacement.dernier">
                {{ formatDate(emplacement.dernier.date) }}
                <span v-if="emplacement.via" class="d-block text-body-secondary">
                  via {{ emplacement.via }}
                </span>
              </template>
              <span v-else class="badge text-bg-danger">Jamais</span>
            </span>
          </button>
          <span
            v-if="hasInventairePermission"
            class="text-center flex-shrink-0"
            style="width: 64px"
          >
            <button
              v-if="!emplacement.enCours"
              type="button"
              class="btn btn-sm btn-outline-primary border-0"
              title="Inventorier"
              :aria-label="`Inventorier ${emplacement.designation}`"
              @click="demarrer(emplacement.id)"
            >
              <font-awesome-icon :icon="['far', 'clipboard']" />
            </button>
          </span>
        </li>
      </ul>
    </template>
  </base-card>
</template>
