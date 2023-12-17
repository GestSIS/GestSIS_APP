<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb m-3">
            <li class="breadcrumb-item">
              <router-link :to="{ name: 'accueil' }">Accueil</router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Mes infos
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>

    <div class="row">
      <div class="col-md-12">
        <nav id="nav-tab" class="nav nav-tabs mb-3" role="tablist">
          <router-link
            v-for="{ route, label } in tabs"
            :key="route"
            class="nav-item nav-link"
            role="tab"
            exact-active-class="active"
            :to="{ name: route }"
            >{{ label }}</router-link
          >
        </nav>
        <div id="nav-tabContent" class="tab-content">
          <div class="tab-pane fade show active" role="tabpanel">
            <div class="col-12">
              <router-view />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ExerciceComptable from '/src/components/exercice_comptable/ExerciceComptable.vue';
import store from '/src/store/index';

async function loadData(routeTo, next) {
  const loadExercicesComptables = store.dispatch('fetchExercicesComptables');

  Promise.all([loadExercicesComptables]).then(() => {
    next();
  });
}

export default {
  name: 'PageMesInfos',
  components: { ExerciceComptable },
  data() {
    return {
      tabs: [
        {
          route: 'mes-infos',
          label: 'Mes infos',
        },
        {
          route: 'mes-exercices',
          label: 'Mes exercices',
        },
        {
          route: 'mes-interventions',
          label: 'Mes interventions',
        },
        {
          route: 'mes-absences',
          label: 'Mes absences',
        },
        {
          route: 'mon-materiel',
          label: 'Mon matériel',
        },
        {
          route: 'mes-travaux',
          label: 'Ma fiche de travail',
        },
        {
          route: 'mes-decomptes',
          label: 'Mes décomptes',
        },
        {
          route: 'mes-controles-medicaux',
          label: 'Mes contrôles médicaux',
        },
        {
          route: 'mes-cours',
          label: 'Mes cours',
        },
        {
          route: 'mes-fonctions',
          label: 'Mes fonctions',
        },
        {
          route: 'mes-grades',
          label: 'Mes grades',
        },
        {
          route: 'mes-groupes',
          label: 'Mes groupes',
        },
        {
          route: 'mes-mutations',
          label: 'Mes mutations',
        },
        {
          route: 'mes-permis',
          label: 'Mes permis',
        },
      ],
    };
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
};
</script>
