<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useControleStore } from "../../stores/materiel/Controle.js";
import permissions from "../../composables/permissions.js";
import useHasPermission from "../../composables/usePermission.js";
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

const controleStore = useControleStore();
await Promise.all([controleStore.fetchControles(), controleStore.fetchStatuts()]);

const hasConfigPermission = useHasPermission(permissions.MATERIEL.CONFIG);

const filtre = ref("");

const statutParControleId = computed(() =>
  Object.fromEntries(
    controleStore.statuts.map((s) => [
      s.controle_id,
      s.nb_en_retard > 0 ? "danger" : s.nb_en_preavis > 0 ? "warning" : null,
    ]),
  ),
);

const listeControles = computed(() =>
  controleStore.liste
    .map((c) => ({
      ...c,
      value: c.id,
      label: c.nom,
      statut: statutParControleId.value[c.id] ?? null,
    }))
    .sort((a, b) => a.nom.localeCompare(b.nom)),
);

const controlesFiltres = computed(() =>
  listeControles.value.filter((c) =>
    c.nom.toLowerCase().includes(filtre.value.toLowerCase().trim(" ")),
  ),
);

const selectedControleId = computed({
  get: () => (route.name === "materiel-controles-details" ? Number(route.params.id) : null),
  set: (value) =>
    router.push(
      value == null
        ? { name: "materiel-controles" }
        : { name: "materiel-controles-details", params: { id: value } },
    ),
});
</script>

<template>
  <!-- Mobile : select unique, recherche intégrée sur le nom. -->
  <div class="d-md-none mb-2 d-flex gap-2">
    <router-link
      v-if="hasConfigPermission"
      :to="{ name: 'param-materiel-controles' }"
      class="btn btn-sm btn-outline-primary flex-shrink-0"
    >
      <font-awesome-icon :icon="['far', 'edit']" />
    </router-link>
    <div data-assembled-select class="flex-grow-1">
      <select-root v-model="selectedControleId" searchable clearable>
        <select-trigger>
          <select-value placeholder="Sélectionnez un contrôle" />
          <select-input />
          <select-clear />
          <select-trailing-icon />
        </select-trigger>
        <select-popover>
          <select-listbox>
            <select-no-options>Aucun résultat</select-no-options>
            <select-option
              v-for="c in listeControles"
              :key="c.value"
              :value="c.value"
              :label="c.label"
            >
              {{ c.statut === "danger" ? "🔴 " : c.statut === "warning" ? "🟡 " : "" }}{{ c.label }}
            </select-option>
          </select-listbox>
        </select-popover>
      </select-root>
    </div>
  </div>

  <!-- Desktop : liste complète avec recherche externe. -->
  <div class="d-none d-md-block">
    <div class="input-group mb-2">
      <router-link
        v-if="hasConfigPermission"
        :to="{ name: 'param-materiel-controles' }"
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
        aria-describedby="filtre controle"
      />
      <span id="basic-addon1" class="input-group-text">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" />
      </span>
    </div>
    <div class="card mb-2">
      <ul class="list-group list-group-flush">
        <li v-if="controlesFiltres.length === 0" class="list-group-item pt-1 pb-1">
          Aucun contrôle
        </li>
        <router-link
          v-for="c in controlesFiltres"
          :key="c.id"
          v-slot="{ navigate, isExactActive }"
          custom
          :to="{ name: 'materiel-controles-details', params: { id: c.id } }"
        >
          <a
            class="nav-link list-group-item list-group-item-action p-1 ps-3"
            href="#"
            role="link"
            :class="{ active: isExactActive }"
            @click="navigate"
          >
            <font-awesome-icon
              v-if="statutParControleId[c.id]"
              v-tooltip.bottom="
                statutParControleId[c.id] === 'danger'
                  ? 'Des articles sont en retard de contrôle'
                  : 'Des articles approchent de leur échéance de contrôle'
              "
              :icon="['fas', 'triangle-exclamation']"
              :class="statutParControleId[c.id] === 'danger' ? 'text-danger' : 'text-warning'"
              class="me-1"
            />
            {{ c.nom }}
          </a>
        </router-link>
      </ul>
    </div>
  </div>
</template>
