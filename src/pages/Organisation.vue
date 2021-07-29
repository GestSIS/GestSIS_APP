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
            <button class="btn btn-outline-primary">Modifier</button>
          </div>
          <div class="card-body">
            <tree
              :tree="groupeTree"
              :_types="types"
              :selectable="true"
              @selected="selected"
            />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h3>Infos complémentaires</h3>
          </div>
          <div class="card-body">
            <button
              class="btn btn-primary"
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

import Tree from '@/components/tree/Tree.vue';
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
    Tree,
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
      types: {
        homme: {
          icon: ['fas', 'mars'],
          color: '#3498db',
        },
        femme: {
          icon: ['fas', 'venus'],
          color: '#9b59b6',
        },
        groupe: {
          icon: ['fas', 'sitemap'],
          color: '#2c3e50',
        },
        groupeInter: {
          icon: ['fas', 'fire'],
          color: '#f39c12',
        },
        // fonction: {icon: ['fas', 'medal'],},cours: {icon: ['fas', 'book'],},grade: {icon: ['fas', 'award'],},alphabetique: {icon: ['fas', 'sort-alpha-up-alt'],},civilite: {icon: ['fas', 'user'],},date: {icon: ['fas', 'birthday-cake'],},exercice: {icon: ['fas', 'calendar-alt'],},excuse: {icon: ['fas', 'scroll'],},intervention: {icon: ['fas', 'fire-extinguisher'],},permis: {icon: ['fas', 'car'],},
      },
      tree: [
        {
          id: 'g',
          type: 'groupe',
          label: 'Groupes',
          children: () => this.groupeTree,
        },
      ],
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste,
      sapeurs: (state) => state.sapeur.liste,
    }),
    groupeTree() {
      const groupFilter = (pereId) => (g) => g.pere_id == pereId;
      const sapeurMapping = (s) => {
        const sapeur = this.sapeurs.find((sap) => sap.id === s.sapeur_id) || {
          nom: 'Ancien',
          prenom: 'Sapeur',
          civilite: 1,
          id: s.sapeur_id,
        };
        return {
          id: s.sapeur_id,
          key: `s-${s.sapeur_id}`,
          label: `${sapeur.nom} ${sapeur.prenom}`,
          type: sapeur.civilite_id === 1 ? 'homme' : 'femme',
        };
      };
      const groupeMapping = (g) => ({
        label: g.no ? `${g.no} ${g.designation}` : g.designation,
        type: g.type == 0 ? 'groupe' : 'groupeInter',
        id: g.id,
        key: `g-${g.id}`,
        children: () => [
          ...this.groupes.filter(groupFilter(g.id)).map(groupeMapping),
          ...g.sapeur_ids.map(sapeurMapping),
        ],
      });

      return this.groupes.filter(groupFilter(null)).map(groupeMapping);
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    selected(elem) {
      this.active = elem;
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
        size: 3,
        callback,
        data,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
