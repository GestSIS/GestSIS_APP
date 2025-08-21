<script setup>
import { computed, ref } from 'vue';
import permissions from '../../store/permissions';
import useHasPermission from '../../hooks/usePermission';
import SapeurService from '../../services/SapeurService';

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});

const listeSapeurs = (
  await SapeurService.getSapeurs({
    'avec-materiel': true,
  })
).map((s) => ({ ...s, nom_prenom: `${s.nom} ${s.prenom}` }));

const hasSapeurEditPermission = useHasPermission(
  permissions.SAPEUR.MODIFICATION,
);

const filtre = ref('');

const sapeurs = computed(() =>
  listeSapeurs.filter((s) =>
    s.nom_prenom.toLowerCase().includes(filtre.value.toLowerCase().trim(' ')),
  ),
);
</script>

<template>
  <div class="input-group mb-2">
    <router-link
      v-if="hasSapeurEditPermission"
      :to="{ name: 'sapeur-index', params: { id: 0 } }"
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
            v-tooltip.bottom="'Sapeur inactif'"
            class="text-danger"
            :icon="['fas', 'triangle-exclamation']"
          />{{ item.nom_prenom }}
        </a>
      </router-link>
    </ul>
  </div>
</template>
