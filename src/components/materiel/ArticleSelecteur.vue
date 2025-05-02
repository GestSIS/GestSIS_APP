<script setup>
import { computed, inject, nextTick, ref, useTemplateRef } from 'vue';

import { useStore } from 'vuex';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import ArticleService from '../../services/materiel/ArticleService';
import { indexedData } from '../../tools';
import SelectEmplacement from './SelectEmplacement.vue';
import VueSelect from 'vue3-select-component';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import TagCouleur from './TagCouleur.vue';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const selectedArticles = defineModel({ default: () => [] });
selectedArticles.value.push({
  id: null,
  materiel_type_id: null,
  emplacement_id: null,
  taille: null,
  remarque: null,
});

const materielTypeStore = useMaterielTypeStore();
const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();
const store = useStore();

await Promise.all([
  materielTypeStore.fetchMaterielTypes(),
  emplacementStore.fetchEmplacements(),
  couleurStore.fetchCouleurs(),
  store.dispatch('fetchListeSapeur'),
]);

const types = computed(() => materielTypeStore.liste);
const indexedTypes = computed(() => indexedData(materielTypeStore.liste));
const indexedCouleurs = computed(() => indexedData(couleurStore.liste));

const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
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
        label: ids
          .map((id) => indexedEmplacements.value[id].designation)
          .join(' '),
      };
    })
    .sort((a, b) => a.tri - b.tri);
});

const articlesAttribuable = ref(await ArticleService.getAttribuable());

// types des articles disponible
const typesDisponible = computed(() => {
  const ids = new Set(articlesAttribuable.value.map((a) => a.materiel_type_id));
  return types.value.filter((t) => ids.has(t.id));
});

const articleReference = useTemplateRef(`articles-reference`);
const addEmptyLine = () => {
  selectedArticles.value.push({
    materiel_type_id: null,
    numero: null,
    taille: null,
    remarque: null,
  });

  nextTick(() => {
    articleReference.value[articleReference.value.length - 1].focus();
  });
};

const selectEmplacement = (item, value) => {
  // TODO: a implémenter
};
const selectMaterielTypeNumerote = (item, value) => {
  // Select première combinaison valable
  const materiel = articlesAttribuable.value.find(
    (m) => m.materiel_type_id == value,
  );
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
        <th class="col-1"></th>
      </tr>
    </thead>
    <tbody v-if="articlesAttribuable.length === 0">
      <tr>
        <td colspan="6">
          Aucun article dans l'inventaire, utilisez l'attribution hors
          inventaire ou ajouter du matériel au préalable.
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
            base-option="&lt;Sélectionnez le matériel type&gt;"
            :base-value="null"
            @update:model-value="
              (value) => selectMaterielTypeNumerote(item, value)
            "
          />
        </td>
        <td v-if="!item.materiel_type_id" colspan="3"></td>
        <td v-if="item.materiel_type_id">
          <vue-select
            v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
            v-model="item.id"
            :is-clearable="false"
            noResults="Aucun article correspondant"
            :options="
              articlesAttribuable
                .filter((a) => a.materiel_type_id == item.materiel_type_id)
                .map((a) => ({
                  value: a.id,
                  label: a.numero?.length ? a.numero : '<sans numéro>',
                }))
            "
          />
          <!-- <base-select
            v-if="indexedTypes[item.materiel_type_id]?.est_numerote"
            v-model="item.id"
            :options="
              articlesAttribuable.filter(
                (a) => a.materiel_type_id == item.materiel_type_id,
              )
            "
            display-key="numero"
          /> -->
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Matériel non numéroté'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="item.materiel_type_id">
          <base-select
            v-if="indexedTypes[item.materiel_type_id]?.est_taillee"
            v-model="item.id"
            :options="
              articlesAttribuable.filter(
                (a) => a.materiel_type_id == item.materiel_type_id,
              )
            "
            display-key="taille"
          />
          <font-awesome-icon
            v-else
            class="ms-4"
            v-tooltip.bottom="'Taille unique'"
            :icon="['far', 'circle-question']"
          />
        </td>
        <td v-if="item.materiel_type_id">
          <VueSelect
            v-model="item.id"
            :is-clearable="false"
            :options="
              articlesAttribuable
                .filter((a) => a.materiel_type_id == item.materiel_type_id)
                .map((a) => ({ ...v, value: a.id, label: a.designation }))
            "
            placeholder="Sélectionnez un emplacement"
          >
            <template #value="{ option }">
              <tag-couleur
                v-for="id in emplacements.find(
                  (e) =>
                    e.id ===
                    articlesAttribuable.find((a) => a.id === option.value)
                      .emplacement_id,
                ).emplacements ?? []"
                :key="id"
                :couleur="indexedCouleurs[indexedEmplacements[id].couleur_id]"
              >
                {{ indexedEmplacements[id].designation }}
              </tag-couleur>
            </template>
            <template #option="{ option }">
              <tag-couleur
                v-for="id in emplacements.find(
                  (e) =>
                    e.id ===
                    articlesAttribuable.find((a) => a.id === option.value)
                      .emplacement_id,
                ).emplacements ?? []"
                :key="id"
                :couleur="indexedCouleurs[indexedEmplacements[id].couleur_id]"
              >
                {{ indexedEmplacements[id].designation }}
              </tag-couleur>
            </template>
          </VueSelect>
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

<style scoped>
:deep(.control) {
  border-radius: var(--bs-border-radius-sm);
  min-height: 31px;
}
:deep(.menu) {
  --vs-menu-offset-top: 0px;
}
:deep(.single-value) {
  font-size: 0.875rem;
  padding-left: 4px;
  display: flex;
}
:deep(.value-container) {
  padding: 0px;
}
</style>
