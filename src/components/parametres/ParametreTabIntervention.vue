<template>
  <div class="row">
    <div class="col-sm-12 col-xl-3">
      <!-- general form elements -->
      <div class="card card-primary card-outline">
        <!-- /.card-header -->
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres interventions</h3>
        </div>
        <nav
          class="nav flex-column nav-pills"
          role="tablist"
          aria-orientation="vertical"
        >
          <a
            class="nav-link"
            :class="{ active: tab === 'vehicule' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'vehicule'"
          >
            Véhicules
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'materiel' }"
            href="#"
            role="tab"
            @click.prevent="tab = 'materiel'"
          >
            Matériel
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'mission' }"
            href="#"
            @click.prevent="tab = 'mission'"
          >
            Missions
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'telephone' }"
            href="#"
            @click.prevent="tab = 'telephone'"
          >
            Téléphones
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'traitement' }"
            href="#"
            @click.prevent="tab = 'traitement'"
          >
            Traitement
          </a>
          <a
            class="nav-link"
            :class="{ active: tab === 'type' }"
            href="#"
            @click.prevent="tab = 'type'"
          >
            Type d'intervention
          </a>
        </nav>
      </div>
    </div>
    <div class="col-sm-12 col-xl-9">
      <parametre-materiel v-if="tab === 'materiel'" />
      <parametre-vehicule v-if="tab === 'vehicule'" />
      <parametre-mission v-if="tab === 'mission'" />
      <parametre-telephone v-if="tab === 'telephone'" />
      <parametre-traitement v-if="tab === 'traitement'" />
      <parametre-type-intervention v-if="tab === 'type'" />
    </div>
  </div>
</template>

<script>
import store from '@/store/index';
import ParametreMission from './ParametreMission.vue';
import ParametreTelephone from './ParametreTelephone.vue';
import ParametreMateriel from './ParametreMateriel.vue';
import ParametreVehicule from './ParametreVehicule.vue';
import ParametreTraitement from './ParametreTraitement.vue';
import ParametreTypeIntervention from './ParametreTypeIntervention.vue';

async function loadData(_, next) {
  const loadVehicule = store.dispatch('fetchVehicules');
  const loadMateriel = store.dispatch('fetchMateriels');
  const loadMission = store.dispatch('fetchMissions');
  const loadAppel = store.dispatch('fetchTelephones');
  const loadStatIntervention = store.dispatch('fetchStatInterventions');
  const loadTypeIntervention = store.dispatch('fetchTypeInterventions');
  const loadTraitement = store.dispatch('fetchInterventionTraitements');
  const loadUnite = store.dispatch('fetchUnites');

  Promise.all([
    loadVehicule,
    loadMateriel,
    loadMission,
    loadAppel,
    loadStatIntervention,
    loadTypeIntervention,
    loadTraitement,
    loadUnite,
  ]).then(() => {
    next();
  });
}

export default {
  name: 'ParametreTabIntervention',
  components: {
    ParametreMission,
    ParametreTelephone,
    ParametreMateriel,
    ParametreVehicule,
    ParametreTraitement,
    ParametreTypeIntervention,
  },
  beforeRouteEnter(routeTo, _, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, _, next) {
    loadData(routeTo, next);
  },
  data() {
    return { tab: 'vehicule' };
  },
  methods: {
    // newExerciceComptable() {
    // },
    // save() {
    // },
  },
};
</script>

<style scoped></style>
