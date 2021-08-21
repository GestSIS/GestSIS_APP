<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb bg-white">
          <li class="breadcrumb-item">
            <router-link tag="a" to="/">Accueil</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Organisation
          </li>
        </ol>
      </div>
      <div class="col-md-6 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-8">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h3>Groupes</h3>
            <!-- <button class="btn btn-outline-primary">Modifier</button> -->
          </div>
          <div class="card-body">
            <groupe-affichage v-if="!editMode" @selected="selected" />
            <groupe-edition v-else @selected="selected" />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h3>Actions</h3>
          </div>
          <div class="card-body">
            <button class="btn btn-primary mb-2 mr-2" @click="modifierGroupes">
              {{ editMode ? 'Mode affichage' : 'Mode édition' }}
            </button>
            <button
              class="btn btn-primary mb-2"
              :disabled="
                !(
                  active &&
                  (active.type == 'groupe' || active.type == 'groupeInter')
                )
              "
              @click="addSapeurs(active)"
            >
              Ajouter/enlever des sapeurs
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '@/store/index';

import GroupeAffichage from '@/components/groupe/GroupeAffichage.vue';
import GroupeEdition from '@/components/groupe/GroupeEdition.vue';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';

async function loadData(routeTo, next) {
  let loadSapeurs = store.dispatch('fetchListeSapeur');
  let loadGroupes = store.dispatch('fetchGroupes');

  Promise.all([loadSapeurs, loadGroupes]).then(() => {
    next();
  });
}

export default {
  name: 'groupes',
  components: {
    GroupeAffichage,
    GroupeEdition,
    ExerciceComptable,
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      active: null,
      editMode: false,
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste.filter((g) => g.actif),
      sapeurs: (state) => state.sapeur.liste,
    }),
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(elem) {
      this.active = elem;
    },
    modifierGroupes() {
      this.editMode = !this.editMode;
      // const data = [];
      // this.SHOW_MODAL({
      //   component: 'ModalGroupeEdition',
      //   size: 1,
      //   data,
      // });
    },
    addSapeurs(node) {
      if (!(node.type == 'groupe' || node.type == 'groupeInter')) {
        return;
      }
      const groupe = this.groupes.find((g) => g.id == node.id);
      const data = groupe.sapeur_ids.map((s) => s.sapeur_id).slice(0);

      const svm = this;
      const callback = (res) => {
        if (!res) {
          return;
        }
        const { tous } = res;
        return svm.$store.dispatch('updateGroupeSapeurs', {
          groupeId: node.id,
          sapeurIds: tous,
        });
      };

      this.SHOW_MODAL({
        component: 'ModalSapeurSelect',
        size: 2,
        callback,
        data,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
