<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import permissions from "../../composables/permissions.js";
import { useHasPermission } from "../../composables/useHasPermission.js";
import SapeurService from "../../services/SapeurService";
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
import { STATUT } from "../../tools/sapeur.js";

const route = useRoute();
const router = useRouter();

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});

const listeSapeurs = (
  await SapeurService.getSapeurs({
    "avec-materiel": true,
  })
).map((s) => ({
  ...s,
  nom_prenom: `${s.nom} ${s.prenom}`,
  actif: s.statut_sapeur === STATUT.ACTIF || s.statut_civil === STATUT.ACTIF,
  value: s.id,
  label: `${s.nom} ${s.prenom}`,
}));

const hasSapeurEditPermission = useHasPermission(permissions.SAPEUR.MODIFICATION);

const filtre = ref("");

const sapeurs = computed(() =>
  listeSapeurs.filter((s) =>
    s.nom_prenom.toLowerCase().includes(filtre.value.toLowerCase().trim(" ")),
  ),
);

const selectedSapeurId = computed({
  get: () => (route.name === "materiel-par-sapeur-details" ? Number(route.params.id) : null),
  set: (value) =>
    router.push(
      value == null
        ? { name: "materiel-par-sapeur" }
        : { name: "materiel-par-sapeur-details", params: { id: value } },
    ),
});
</script>

<template>
  <!-- Mobile : select unique, recherche intégrée sur le nom. -->
  <div class="d-md-none mb-2 d-flex gap-2">
    <router-link
      v-if="hasSapeurEditPermission"
      aria-label="Modifier"
      :to="{ name: 'sapeur-details', params: { id: id ?? 0 } }"
      class="btn btn-sm btn-outline-primary flex-shrink-0"
    >
      <font-awesome-icon :icon="['far', 'edit']" />
    </router-link>
    <div data-assembled-select class="flex-grow-1">
      <select-root v-model="selectedSapeurId" searchable clearable>
        <select-trigger>
          <select-value placeholder="Sélectionnez un sapeur" />
          <select-input />
          <select-clear />
          <select-trailing-icon />
        </select-trigger>
        <select-popover>
          <select-listbox>
            <select-no-options>Aucun résultat</select-no-options>
            <select-option
              v-for="item in listeSapeurs"
              :key="item.value"
              :value="item.value"
              :label="item.label"
              :class="{ 'text-danger': !item.actif }"
            >
              <font-awesome-icon
                v-if="!item.actif"
                v-tooltip.bottom="'Inactif'"
                :icon="['fas', 'triangle-exclamation']"
                class="me-1"
              />{{ item.label }}
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
        v-if="hasSapeurEditPermission"
        aria-label="Modifier"
        :to="{ name: 'sapeur-details', params: { id: id ?? 0 } }"
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
    <base-card>
      <ul class="list-group list-group-flush">
        <li v-if="sapeurs.length === 0" class="list-group-item pt-1 pb-1">
          <td class="border-bottom-0">Aucun sapeur</td>
        </li>
        <router-link
          v-for="item in sapeurs"
          :key="item.id"
          v-slot="{ navigate, isExactActive }"
          custom
          :to="{
            name: 'materiel-par-sapeur-details',
            params: { id: item.id },
          }"
        >
          <a
            class="nav-link list-group-item list-group-item-action pt-1 pb-1"
            href="#"
            role="link"
            :class="{
              active: isExactActive,
              'bg-danger-subtle': !item.actif && !isExactActive,
            }"
            @click="navigate"
          >
            <font-awesome-icon
              v-if="!item.actif"
              v-tooltip.bottom="'Inactif'"
              class="text-danger"
              :icon="['fas', 'triangle-exclamation']"
            />{{ item.nom_prenom }}
          </a>
        </router-link>
      </ul>
    </base-card>
  </div>
</template>
