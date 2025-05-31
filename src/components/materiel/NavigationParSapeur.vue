<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import permissions from '../../store/permissions';

const { id } = defineProps({
  id: {
    type: String,
    required: false,
  },
});

const store = useStore();
store.dispatch('fetchListeSapeur');

const hasSapeurEditPermission = computed(
  () =>
    store.state.auth.admin ||
    store.state.auth.sis.permissions.includes(permissions.SAPEUR.MODIFICATION),
);
const filtre = ref('');

const sapeurs = computed(() =>
  store.state['sapeur'].liste
    .filter((s) => s.actif)
    .filter((s) =>
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
  <div class="card">
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
          :class="{ active: isExactActive }"
          @click="navigate"
          >{{ item.nom_prenom }}
        </a>
      </router-link>
    </ul>
  </div>
</template>

<style scoped></style>
