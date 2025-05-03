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
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <suspense>
        <parametre-materiel-type-categorie v-if="tab === 'categorie'" />
        <parametre-materiel-couleur v-else-if="tab === 'couleur'" />
        <template #fallback>Chargement...</template>
      </suspense>
    </div>
  </div>
</template>

<script>
import ParametreMaterielTypeCategorie from './ParametreMaterielTypeCategorie.vue';
import ParametreMaterielCouleur from './ParametreMaterielCouleur.vue';

export default {
  name: 'ParametreTabMaterielPersonnel',
  components: {
    ParametreMaterielTypeCategorie,
    ParametreMaterielCouleur,
  },
  data() {
    return { tab: 'categorie' };
  },
};
</script>

<style scoped></style>
