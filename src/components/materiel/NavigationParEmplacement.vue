<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { groupedByData, indexedData } from "../../tools/index.js";
import TagCouleur from "./TagCouleur.vue";
import permissions from "../../composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
import { useModalStore } from "../../stores/common/Modal";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectInput,
  SelectClear,
  SelectTrailingIcon,
  SelectPopover,
  SelectListbox,
  SelectNoOptions,
  SelectOption,
} from "vue3-select-component/primitives";

const route = useRoute();
const router = useRouter();

const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();

await Promise.all([couleurStore.fetchCouleurs(), emplacementStore.fetchEmplacements()]);

const hasConfigPermission = useHasPermission(permissions.MATERIEL.CONFIG);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const emplacementsGroupedByParent = computed(() =>
  groupedByData(emplacementStore.liste, "parent_id"),
);

const filtre = ref("");

const computedData = computed(() => {
  const lowerFilter = filtre.value.toLowerCase().trim(" ");
  const filteredIds = emplacementStore.liste
    .filter((e) => e.statut)
    .filter((e) => e.designation.toLowerCase().includes(lowerFilter))
    .flatMap((e) => {
      const parentIds = (id) =>
        id > 0
          ? [
              indexedEmplacements.value[id]?.parent_id,
              ...parentIds(indexedEmplacements.value[id]?.parent_id),
            ]
          : [];
      return [e.id, ...parentIds(e.id)];
    });

  const recursive = (parent_id, level = 0) => {
    return [...(emplacementsGroupedByParent.value[parent_id] ?? [])].flatMap((elem) => [
      { ...elem, level },
      ...recursive(elem.id, level + 1),
    ]);
  };

  return recursive(null).filter((e) => filteredIds.includes(e.id));
});

// Liste à plat pour le select mobile (recherche intégrée sur le libellé
// complet, même approche que SelectEmplacement.vue), mais dans l'ordre de
// l'arbre : un emplacement racine, puis récursivement tous ses enfants,
// avant de passer à la racine suivante (même parcours que `computedData`,
// pas un simple tri par `tri` qui mélangerait les branches).
const emplacementsOptions = computed(() => {
  const ancestorsAndSelf = (id) => [
    ...(indexedEmplacements.value[id]?.parent_id > 0
      ? ancestorsAndSelf(indexedEmplacements.value[id]?.parent_id)
      : []),
    id,
  ];

  const recursive = (parentId) =>
    [...(emplacementsGroupedByParent.value[parentId] ?? [])]
      .sort((a, b) => a.tri - b.tri)
      .flatMap((elem) => [elem, ...recursive(elem.id)]);

  return recursive(null)
    .filter((e) => e.statut)
    .map((e) => {
      const ids = ancestorsAndSelf(e.id);
      return {
        ...e,
        value: e.id,
        emplacements: ids,
        label: ids.map((id) => indexedEmplacements.value[id]?.designation).join(" "),
      };
    });
});

// Retrouve l'option complète (avec sa hiérarchie) depuis la valeur sélectionnée,
// pour que l'affichage replié du select rende comme les options de la liste.
const emplacementParValeur = computed(() =>
  Object.fromEntries(emplacementsOptions.value.map((e) => [e.value, e])),
);

const selectedEmplacementId = computed({
  get: () => (route.name === "materiel-par-emplacement-details" ? Number(route.params.id) : null),
  set: (value) =>
    router.push(
      value == null
        ? { name: "materiel-par-emplacement" }
        : { name: "materiel-par-emplacement-details", params: { id: value } },
    ),
});

const { showModal } = useModalStore();
const ajoutEmplacement = () =>
  showModal({
    component: "ModalChoixTypeEmplacement",
    data: {},
  });
</script>

<template>
  <!-- Mobile : select unique à plat, recherche intégrée sur le libellé
  complet (chemin de la hiérarchie), même approche que SelectEmplacement.vue. -->
  <div class="d-md-none mb-2 d-flex gap-2">
    <router-link
      v-if="hasConfigPermission"
      :to="{ name: 'param-materiel' }"
      class="btn btn-sm btn-outline-primary flex-shrink-0"
    >
      <font-awesome-icon :icon="['far', 'edit']" />
    </router-link>
    <div data-assembled-select class="flex-grow-1">
      <select-root v-model="selectedEmplacementId" searchable clearable>
        <select-trigger>
          <select-value placeholder="Sélectionnez un emplacement">
            <template #default="{ selectedOptions }">
              <template v-for="sel in selectedOptions" :key="sel.value">
                <tag-couleur
                  v-for="id in emplacementParValeur[sel.value]?.emplacements ?? []"
                  :key="id"
                  :couleur="indexedCouleurs[indexedEmplacements[id]?.couleur_id]"
                >
                  <font-awesome-icon
                    v-if="indexedEmplacements[id]?.hangar"
                    :icon="['far', 'house']"
                    class="me-1"
                  />
                  <font-awesome-icon
                    v-if="indexedEmplacements[id]?.article_id"
                    :icon="['fas', 'car']"
                    class="me-1"
                  />
                  {{ indexedEmplacements[id]?.designation }}
                </tag-couleur>
              </template>
            </template>
          </select-value>
          <select-input />
          <select-clear />
          <select-trailing-icon />
        </select-trigger>
        <select-popover>
          <select-listbox>
            <select-no-options>Aucun résultat</select-no-options>
            <select-option
              v-for="emplacement in emplacementsOptions"
              :key="emplacement.value"
              :value="emplacement.value"
              :label="emplacement.label"
            >
              <tag-couleur
                v-for="id in emplacement.emplacements"
                :key="id"
                :couleur="indexedCouleurs[indexedEmplacements[id]?.couleur_id]"
              >
                <font-awesome-icon
                  v-if="indexedEmplacements[id]?.hangar"
                  :icon="['far', 'house']"
                  class="me-1"
                />
                <font-awesome-icon
                  v-if="indexedEmplacements[id]?.article_id"
                  :icon="['fas', 'car']"
                  class="me-1"
                />
                {{ indexedEmplacements[id]?.designation }}
              </tag-couleur>
            </select-option>
          </select-listbox>
        </select-popover>
      </select-root>
    </div>
    <button class="btn btn-sm btn-outline-primary" @click="ajoutEmplacement">
      <font-awesome-icon :icon="['fas', 'plus']" />
    </button>
  </div>

  <!-- Desktop : arbre complet avec recherche externe. -->
  <div class="d-none d-md-block">
    <div class="input-group mb-2">
      <router-link
        v-if="hasConfigPermission"
        :to="{ name: 'param-materiel' }"
        class="btn btn-sm btn-outline-primary"
      >
        <font-awesome-icon :icon="['far', 'edit']" />
      </router-link>
      <input
        v-model="filtre"
        type="text"
        class="form-control form-control-sm"
        placeholder="Chercher..."
        aria-label="Chercher..."
        aria-describedby="filtre emplacement"
      />
      <span id="basic-addon1" class="input-group-text">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
      </span>
    </div>
    <div class="card mb-2">
      <ul class="ps-0 mb-1">
        <li v-if="computedData.length === 0" class="list-group-item pt-1 pb-1">
          <span class="border-bottom-0">Aucun emplacement</span>
        </li>
        <router-link
          v-for="item in computedData.slice(0)"
          :key="item.globalId"
          v-slot="{ navigate, isExactActive }"
          :style="{
            'padding-left': 10 + item.level * 25 + 'px',
          }"
          custom
          :to="{
            name: 'materiel-par-emplacement-details',
            params: { id: item.id },
          }"
        >
          <a
            class="nav-link list-group-item list-group-item-action pt-1 pb-1"
            href="#"
            role="link"
            :class="{ 'bg-primary-subtle': isExactActive }"
            @click="navigate"
          >
            <tag-couleur :couleur="indexedCouleurs[item.couleur_id]">
              <font-awesome-icon
                v-if="item.hangar"
                v-tooltip.bottom="'Hangar'"
                :icon="['far', 'house']"
                class="me-1"
              />
              <font-awesome-icon
                v-if="item.article_id"
                v-tooltip.bottom="'Véhicule'"
                :icon="['fas', 'car']"
                class="me-1"
              />
              {{ item.designation }}
            </tag-couleur>
          </a>
        </router-link>
      </ul>
    </div>
    <button class="btn btn-sm btn-outline-primary w-100" @click="ajoutEmplacement">Ajouter</button>
  </div>
</template>
