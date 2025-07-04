<script setup>
import ParametreMaterielTypeCategorie from './ParametreMaterielTypeCategorie.vue';
import ParametreMaterielCouleur from './ParametreMaterielCouleur.vue';
import ParametreMaterielEmplacement from './ParametreMaterielEmplacement.vue';
import ParametreBatterieType from './ParametreBatterieType.vue';
import ParametreTuyauDiametre from './ParametreTuyauDiametre.vue';
import { ref } from 'vue';

const tab = ref('categorie');
</script>

<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3 mb-2">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres matériel personnel</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'categorie' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'categorie'"
          >
            Catégories et type de matériel
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'couleur' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'couleur'"
          >
            Couleurs
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'emplacement' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'emplacement'"
          >
            Emplacements
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'batterie-type' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'batterie-type'"
          >
            Batteries types
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'tuyau-diametre' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'tuyau-diametre'"
          >
            Tuyau diamètres
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <suspense>
        <parametre-materiel-type-categorie v-if="tab === 'categorie'" />
        <parametre-materiel-couleur v-else-if="tab === 'couleur'" />
        <parametre-materiel-emplacement v-else-if="tab === 'emplacement'" />
        <parametre-batterie-type v-else-if="tab === 'batterie-type'" />
        <parametre-tuyau-diametre v-else-if="tab === 'tuyau-diametre'" />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
  </div>
</template>
