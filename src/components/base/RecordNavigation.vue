<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

// Flèches précédent / suivant et position « 3 / 48 », dans l'ordre chronologique de la liste
// filtrée par les filtres enregistrés de la page liste (même id que son stateful-filter).
const { filterId, items, currentId, dateKey, label } = defineProps({
  filterId: {
    type: String,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  currentId: {
    type: [String, Number],
    required: true,
  },
  dateKey: {
    type: String,
    default: "date",
  },
  label: {
    type: String,
    default: "Élément",
  },
});

const route = useRoute();

// Du plus ancien au plus récent : « suivant » = date suivante
const sortedItems = computed(() =>
  items.slice().sort((a, b) => (a[dateKey] ?? "").localeCompare(b[dateKey] ?? "")),
);

const currentIndex = (list) => list.findIndex((item) => item.id == currentId);
const neighbour = (list, offset) => {
  const index = currentIndex(list);
  return index >= 0 ? list[index + offset] : undefined;
};

// Reste sur le même onglet (Informations, Présences…)
const target = (item) => ({ name: route.name, params: { ...route.params, id: item.id } });
</script>

<template>
  <stateful-filter :id="filterId" v-slot="{ filteredData }" :data="sortedItems">
    <div v-if="currentIndex(filteredData) >= 0" class="d-flex align-items-center gap-2">
      <router-link
        :to="neighbour(filteredData, -1) ? target(neighbour(filteredData, -1)) : route"
        :aria-label="`${label} précédent`"
        :title="`${label} précédent`"
        class="btn btn-sm btn-outline-secondary"
        :class="{ disabled: !neighbour(filteredData, -1) }"
      >
        <font-awesome-icon :icon="['fas', 'angle-left']" />
      </router-link>
      <span class="text-muted small text-nowrap">
        {{ currentIndex(filteredData) + 1 }} / {{ filteredData.length }}
      </span>
      <router-link
        :to="neighbour(filteredData, 1) ? target(neighbour(filteredData, 1)) : route"
        :aria-label="`${label} suivant`"
        :title="`${label} suivant`"
        class="btn btn-sm btn-outline-secondary"
        :class="{ disabled: !neighbour(filteredData, 1) }"
      >
        <font-awesome-icon :icon="['fas', 'angle-right']" />
      </router-link>
    </div>
  </stateful-filter>
</template>
