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
            :class="{ active: tab === 'events' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'events'"
          >
            Evénements types
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'alertes' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'alertes'"
          >
            Alertes types
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-mat-perso-type-categorie v-if="tab === 'categorie'" />
      <parametre-mat-perso-event-type v-if="tab === 'events'" />
      <parametre-mat-perso-alerte-type v-if="tab === 'alertes'" />
    </div>
  </div>
</template>

<script>
import store from '/src/store/index';

import ParametreMatPersoTypeCategorie from './ParametreMatPersoTypeCategorie.vue';
import ParametreMatPersoEventType from './ParametreMatPersoEventType.vue';
import ParametreMatPersoAlerteType from './ParametreMatPersoAlerteType.vue';

async function loadData(_, next) {
  // TODO: Charger les bonnes données
  const loadEventType = store.dispatch('fetchMatPersoEventTypes');
  const loadAlertType = store.dispatch('fetchMatPersoAlerteTypes');
  const loadMaterielType = store.dispatch('fetchMatPersoTypes');
  const loadMaterielCategorie = store.dispatch('fetchMatPersoCategories');

  Promise.all([
    loadEventType,
    loadAlertType,
    loadMaterielType,
    loadMaterielCategorie,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabMaterielPersonnel',
  components: {
    ParametreMatPersoTypeCategorie,
    ParametreMatPersoEventType,
    ParametreMatPersoAlerteType,
  },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return { tab: 'categorie' };
  },
};
</script>

<style scoped></style>
