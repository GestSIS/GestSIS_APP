<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb bg-white">
            <li class="breadcrumb-item">
              <router-link tag="a" to="/">
                Accueil
              </router-link>
            </li>
            <li class="breadcrumb-item active" aria-current="page">
              Sapeurs
            </li>
          </ol>
        </nav>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-3">
        <!-- /.card-header -->
        <div class="card card-primary card-outline">
          <div class="card-header">
            <h3 class="card-title">Filtres</h3>
            <div class="card-body px-0">
              <div class="custom-control custom-radio custom-control-inline">
                <input
                  type="radio"
                  id="statutActif"
                  name="actif"
                  class="custom-control-input"
                  value="actif"
                  v-model="filter"
                />
                <label class="custom-control-label" for="statutActif"
                  >Actif</label
                >
              </div>
              <div class="custom-control custom-radio custom-control-inline">
                <input
                  type="radio"
                  id="statutInactif"
                  name="actif"
                  class="custom-control-input"
                  value="inactif"
                  v-model="filter"
                />
                <label class="custom-control-label" for="statutInactif"
                  >Inactif</label
                >
              </div>
              <div class="custom-control custom-radio custom-control-inline">
                <input
                  type="radio"
                  id="statutTous"
                  name="actif"
                  class="custom-control-input"
                  value="all"
                  v-model="filter"
                />
                <label class="custom-control-label" for="statutTous"
                  >Tous</label
                >
              </div>
            </div>
          </div>
          <ul class="list-group list-group-flush" id="liste-sapeurs">
            <router-link
              v-for="sapeur in filteredSapeurs"
              tag="li"
              :to="`/sapeurs/${sapeur.id}`"
              :key="sapeur.id"
              class="list-group-item list-group-item-action"
              :class="{
                active: activeSapeurId === sapeur.id
              }"
            >
              {{ sapeur.nom }} {{ sapeur.prenom }}
            </router-link>
            <li v-if="filteredSapeurs.length === 0" class="list-group-item">
              Aucun sapeur
            </li>
          </ul>
        </div>
      </div>
      <div class="col-md-9">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable';

export default {
  components: {
    ExerciceComptable
  },
  mounted() {
    this.$store.dispatch('fetchListSapeur').then(() => {
      if (this.activeSapeurId === 0 && this.listSapeur.length > 0) {
        this.selectSapeur(this.listSapeur[0].id);
      }
    });
  },
  data() {
    return {
      filter: 'actif',
      filters: {
        actif: s => s.actif === 1,
        inactif: s => s.actif === 0,
        all: () => true
      }
    };
  },
  computed: {
    ...mapState({
      listSapeur: state => state.sapeur.liste,
      activeSapeurId: state => state.sapeur.active.id
    }),
    filteredSapeurs() {
      return this.listSapeur.filter(this.filters[this.filter]);
    }
  },
  methods: {
    selectSapeur(sapeurId) {
      this.$store.dispatch('selectSapeur', sapeurId);
    }
  }
};
</script>

<style lang="scss" scoped>
#liste-sapeurs {
  li {
    padding: 0.25rem 0.75rem;
  }
}
</style>
