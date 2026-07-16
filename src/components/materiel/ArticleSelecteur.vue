<script setup>
import { computed, nextTick, useTemplateRef } from "vue";

import { useEmplacementStore } from "../../stores/materiel/Emplacement";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import { indexedData } from "../../tools/index.js";
import { Select } from "vue3-select-component";
import {
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectTrailingIcon,
  SelectPopover,
  SelectListbox,
  SelectNoOptions,
  SelectOption,
} from "vue3-select-component/primitives";
import { useCouleurStore } from "../../stores/materiel/Couleur";
import TagCouleur from "./TagCouleur.vue";
import { useSapeurStore } from "../../stores/sapeur/Sapeur";

const props = defineProps({
  articles: {
    type: Array,
    default: () => [],
  },
});

const articlesAttribuable = computed(() => props.articles);
const selectedArticles = defineModel({ default: () => [] });
if (selectedArticles.value.length === 0) {
  selectedArticles.value.push({
    id: null,
    materiel_type_id: "",
    emplacement_id: null,
    taille: null,
    remarque: null,
  });
}

const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();
const sapeurStore = useSapeurStore();

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  couleurStore.fetchCouleurs(),
  sapeurStore.fetchListeSapeur(),
]);

const types = computed(() => materielTypeStore.liste);
const indexedTypes = computed(() => indexedData(materielTypeStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const indexedSapeurs = computed(() => indexedData(sapeurStore.liste));
const emplacements = computed(() => {
  const recursive = (id) => {
    return [
      ...(indexedEmplacements.value[id]?.parent_id > 0
        ? recursive(indexedEmplacements.value[id]?.parent_id)
        : []),
      id,
    ];
  };
  return emplacementStore.liste
    .map((e) => {
      const ids = recursive(e.id);
      return {
        ...e,
        value: e.id,
        emplacements: ids,
        label: ids.map((id) => indexedEmplacements.value[id].designation).join(" "),
      };
    })
    .sort((a, b) => a.tri - b.tri);
});

// types des articles disponible
const typesDisponible = computed(() => {
  const ids = new Set(articlesAttribuable.value.map((a) => a.materiel_type_id));
  return types.value.filter((t) => ids.has(t.id));
});

// Options du sélecteur d'emplacement/article (rendu personnalisé).
const articlesPourType = (materielTypeId) =>
  articlesAttribuable.value
    .filter((a) => a.materiel_type_id == materielTypeId)
    .map((a) => ({ ...a, value: a.id, label: a.designation }));

// Options du sélecteur par numéro (rendu simple).
const numerosPourType = (materielTypeId) =>
  articlesAttribuable.value
    .filter((a) => a.materiel_type_id == materielTypeId)
    .map((a) => ({
      value: a.id,
      label: a.numero?.length ? a.numero : "<sans numéro>",
    }))
    .sort((a, b) => a.label?.localeCompare(b.label));

const articleParId = (id) => articlesAttribuable.value.find((a) => a.id === id);

const emplacementAncestors = (emplacementId) =>
  emplacements.value.find((e) => e.id === emplacementId)?.emplacements ?? [];

const articleReference = useTemplateRef(`articles-reference`);
const addEmptyLine = () => {
  selectedArticles.value.push({
    materiel_type_id: "",
    numero: null,
    taille: null,
    remarque: null,
  });

  nextTick(() => {
    articleReference.value[articleReference.value.length - 1].focus();
  });
};

const selectMaterielTypeNumerote = (item, value) => {
  // Select première combinaison valable
  const materiel = articlesAttribuable.value.find((m) => m.materiel_type_id == value);
  item.id = materiel?.id;
};
</script>

<template>
  <table class="table table-sm">
    <thead>
      <tr>
        <th class="col-4">Matériel type</th>
        <th class="col-2">Numéro</th>
        <th class="col-2">Taille</th>
        <th class="col-2">Emplacement</th>
        <th>Remarque</th>
        <th class="col-1">Action</th>
      </tr>
    </thead>
    <tbody v-if="articlesAttribuable.length === 0">
      <tr>
        <td colspan="6">
          Aucun article dans l'inventaire, utilisez l'attribution hors inventaire ou ajouter du
          matériel au préalable.
        </td>
      </tr>
    </tbody>
    <tbody v-else>
      <tr v-for="(item, index) in selectedArticles" :key="index">
        <td>
          <base-select
            ref="articles-reference"
            v-model="item.materiel_type_id"
            :options="typesDisponible"
            :required="true"
            placeholder="&lt;Sélectionnez le matériel type&gt;"
            @update:model-value="(value) => selectMaterielTypeNumerote(item, value)"
          />
        </td>
        <td v-if="!item.materiel_type_id" colspan="3"></td>
        <td v-if="item.materiel_type_id">
          <Select
            v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
            v-model="item.id"
            :clearable="false"
            :searchable="false"
            :options="numerosPourType(item.materiel_type_id)"
          >
            <template #no-options>Aucun article correspondant</template>
          </Select>
          <font-awesome-icon
            v-else
            v-tooltip.bottom="'Matériel non numéroté'"
            class="ms-4"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="item.materiel_type_id">
          <base-select
            v-if="indexedTypes[item.materiel_type_id]?.est_taillee"
            v-model="item.id"
            :options="
              [
                ...articlesAttribuable.filter((a) => a.materiel_type_id == item.materiel_type_id),
              ].sort((a, b) => a.taille?.localeCompare(b.taille))
            "
            display-key="taille"
          />
          <font-awesome-icon
            v-else
            v-tooltip.bottom="'Taille unique'"
            class="ms-4"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="item.materiel_type_id" data-assembled-select>
          <select-root v-model="item.id" :options="articlesPourType(item.materiel_type_id)">
            <select-trigger>
              <select-value placeholder="Sélectionnez un emplacement">
                <template #default="{ selectedOptions }">
                  <template v-for="sel in selectedOptions" :key="sel.value">
                    <template v-for="article in [articleParId(sel.value)]" :key="article?.id">
                      <span v-if="article?.sapeur_id" class="badge bg-primary">
                        {{ indexedSapeurs[article.sapeur_id]?.nom_prenom }}
                      </span>
                      <tag-couleur
                        v-for="id in article?.emplacement_id
                          ? emplacementAncestors(article.emplacement_id)
                          : []"
                        :key="id"
                        :couleur="indexedCouleurs[indexedEmplacements[id].couleur_id]"
                      >
                        {{ indexedEmplacements[id].designation }}
                      </tag-couleur>
                    </template>
                  </template>
                </template>
              </select-value>
              <select-trailing-icon />
            </select-trigger>
            <select-popover>
              <select-listbox>
                <select-no-options>Aucun résultat</select-no-options>
                <select-option
                  v-for="article in articlesPourType(item.materiel_type_id)"
                  :key="article.value"
                  :value="article.value"
                  :label="article.label"
                >
                  <span v-if="article.sapeur_id" class="badge bg-primary">
                    {{ indexedSapeurs[article.sapeur_id]?.nom_prenom }}
                  </span>
                  <tag-couleur
                    v-for="id in article.emplacement_id
                      ? emplacementAncestors(article.emplacement_id)
                      : []"
                    :key="id"
                    :couleur="indexedCouleurs[indexedEmplacements[id].couleur_id]"
                  >
                    {{ indexedEmplacements[id].designation }}
                  </tag-couleur>
                </select-option>
              </select-listbox>
            </select-popover>
          </select-root>
        </td>
        <td>{{ item.remarque }}</td>
        <td>
          <button
            class="btn btn-outline-danger border-0"
            @click="selectedArticles.splice(index, 1)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </td>
      </tr>
      <tr>
        <td colspan="6">
          <button class="btn btn-outline-primary" @click="addEmptyLine">
            <font-awesome-icon :icon="['fas', 'plus']" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
