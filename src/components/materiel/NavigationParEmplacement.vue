<script setup>
import { computed, ref } from 'vue';
import { useCouleurStore } from '../../stores/materiel/Couleur';
import { useEmplacementStore } from '../../stores/materiel/Emplacement';
import { groupedByData, indexedData } from '../../tools';
import TagCouleur from './TagCouleur.vue';
import permissions from '../../store/permissions';
import useHasPermission from '../../hooks/usePermission';
import { useModalStore } from '../../stores/common/Modal';

const emplacementStore = useEmplacementStore();
const couleurStore = useCouleurStore();

couleurStore.fetchCouleurs();
emplacementStore.fetchEmplacements();

const hasConfigPermission = useHasPermission(permissions.MATERIEL.CONFIG);

const indexedCouleurs = computed(() => indexedData(couleurStore.liste));
const indexedEmplacements = computed(() => indexedData(emplacementStore.liste));
const emplacementsGroupedByParent = computed(() =>
  groupedByData(emplacementStore.liste, 'parent_id'),
);

const filtre = ref('');

const computedData = computed(() => {
  const lowerFilter = filtre.value.toLowerCase().trim(' ');
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
    return [...(emplacementsGroupedByParent.value[parent_id] ?? [])].flatMap(
      (elem) => [{ ...elem, level }, ...recursive(elem.id, level + 1)],
    );
  };

  return recursive(null).filter((e) => filteredIds.includes(e.id));
});

const { showModal } = useModalStore();
const ajoutEmplacement = () =>
  showModal({
    component: 'ModalEmplacement',
    data: {},
  });
</script>

<template>
  <div class="input-group mb-2">
    <router-link
      v-if="hasConfigPermission"
      :to="{ name: 'param-materiel' }"
      class="btn btn-sm btn-outline-primary"
    >
      <font-awesome-icon :icon="['far', 'edit']" />
    </router-link>
    <input
      type="text"
      v-model="filtre"
      class="form-control form-control-sm"
      placeholder="Chercher..."
      aria-label="Chercher..."
      aria-describedby="filtre emplacement"
    />
    <span class="input-group-text" id="basic-addon1">
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
            {{ item.designation }}
          </tag-couleur>
        </a>
      </router-link>
    </ul>
  </div>
  <button
    class="btn btn-sm btn-outline-primary w-100"
    @click="ajoutEmplacement"
  >
    Ajouter
  </button>
</template>

<style scoped></style>
