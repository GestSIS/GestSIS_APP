<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <ol class="breadcrumb bg-white">
          <li class="breadcrumb-item">
            <router-link tag="a" to="/">
              Accueil
            </router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Organisation
          </li>
        </ol>
      </div>
      <div class="col-md-4 d-flex justify-content-end">
        <exercice-comptable />
      </div>
    </div>
    <div class="row">
      <div class="col-md-12">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <span></span>
            <button class="btn btn-outline-primary">
              Save
            </button>
          </div>
          <div class="card-body">
            <tree :tree="tree" :_types="types" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import store from '@/store/index';

import Tree from '@/components/tree/Tree.vue';
import ExerciceComptable from '@/components/exercice_comptable/ExerciceComptable.vue';

async function loadData(routeTo, next) {
  let loadSapeurs = store.dispatch('fetchListSapeur');
  let loadGroupes = store.dispatch('fetchGroupesSapeurs');

  Promise.all([
    loadSapeurs,
    loadGroupes
  ]).then(() => {
    next();
  });
}

export default {
  name: 'groups',
  components: {
    Tree,
    ExerciceComptable
  },
  beforeRouteEnter(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  beforeRouteUpdate(routeTo, routeFrom, next) {
    loadData(routeTo, next);
  },
  data() {
    return {
      types: {
        homme: {
          icon: ['fas', 'mars'],
        },
        femme: {
          icon: ['fas', 'venus'],
        },
        groupe: {
          icon: ['fas', 'sitemap'],
        },
        fonction: {
          icon: ['fas', 'medal'],
        },
        cours: {
          icon: ['fas', 'book'],
        },
        grade: {
          icon: ['fas', 'award'],
        },
        alphabetique: {
          icon: ['fas', 'sort-alpha-up-alt'],
        },
        civilite: {
          icon: ['fas', 'user'],
        },
        date: {
          icon: ['fas', 'birthday-cake'],
        },
        exercice: {
          icon: ['fas', 'calendar-alt'],
        },
        excuse: {
          icon: ['fas', 'scroll'],
        },
        intervention: {
          icon: ['fas', 'fire-extinguisher'],
        },
        permis: {
          icon: ['fas', 'car'],
        },
      },
      tree: [
        {
          id: 1,
          type: 'groupe',
          label: 'Groupes',
          children: () => this.groupeTree
        }
        // {
        //   id: 2,
        //   label: 'Fonctions',
        //   type: 'fonction',
        //   children: [
        //     {
        //       label: "Organisation d'alarmes",
        //       type: 'groupe',
        //       children: [
        //         {
        //           type: 'homme',
        //           label: 'Georges',
        //         },
        //         {
        //           type: 'femme',
        //           label: 'Louisa',
        //         },
        //       ],
        //     },
        //     {
        //       id: 2,
        //       label: 'Good service (disabled node with icon)',
        //       icon: ['fas', 'sitemap'],
        //       disabled: true,
        //       children: [
        //         { label: 'Prompt attention' },
        //         { label: 'Professional waiter' },
        //       ],
        //     },
        //     {
        //       id: 3,
        //       label: 'Pleasant surroundings (with icon)',
        //       icon: ['fas', 'sitemap'],
        //       children: [
        //         {
        //           label: 'Happy atmosphere (with image)',
        //           img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png',
        //         },
        //         { label: 'Good table presentation' },
        //         { label: 'Pleasing decor' },
        //       ],
        //     },
        //   ],
        // },
        // {
        //   id: 2,
        //   label: 'Sans Fonctions',
        //   type: 'fonction',
        //   children: [
        //     {
        //       label: "Organisation d'alarmes",
        //       type: 'groupe',
        //       children: [
        //         {
        //           type: 'homme',
        //           label: 'Georges',
        //         },
        //         {
        //           type: 'femme',
        //           label: 'Louisa',
        //         },
        //       ],
        //     },
        //     {
        //       id: 2,
        //       label: 'Good service (disabled node with icon)',
        //       icon: ['fas', 'sitemap'],
        //       disabled: true,
        //       children: [
        //         { label: 'Prompt attention' },
        //         { label: 'Professional waiter' },
        //       ],
        //     },
        //     {
        //       id: 3,
        //       label: 'Pleasant surroundings (with icon)',
        //       icon: ['fas', 'sitemap'],
        //       children: [
        //         {
        //           label: 'Happy atmosphere (with image)',
        //           img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png',
        //         },
        //         { label: 'Good table presentation' },
        //         { label: 'Pleasing decor' },
        //       ],
        //     },
        //   ],
        // },
        // {
        //   id: 2,
        //   label: 'Cours suivis',
        //   type: 'cours',
        //   children: [
        //     {
        //       label: "Organisation d'alarmes",
        //       type: 'groupe',
        //       children: [
        //         {
        //           type: 'homme',
        //           label: 'Georges',
        //         },
        //         {
        //           type: 'femme',
        //           label: 'Louisa',
        //         },
        //       ],
        //     },
        //     {
        //       id: 2,
        //       label: 'Good service (disabled node with icon)',
        //       icon: ['fas', 'sitemap'],
        //       disabled: true,
        //       children: [
        //         { label: 'Prompt attention' },
        //         { label: 'Professional waiter' },
        //       ],
        //     },
        //     {
        //       id: 3,
        //       label: 'Pleasant surroundings (with icon)',
        //       icon: ['fas', 'sitemap'],
        //       children: [
        //         {
        //           label: 'Happy atmosphere (with image)',
        //           img: 'https://cdn.quasar.dev/img/logo_calendar_128px.png',
        //         },
        //         { label: 'Good table presentation' },
        //         { label: 'Pleasing decor' },
        //       ],
        //     },
        //   ],
        // },
        // {
        //   id: 2,
        //   label: 'Grade actuel',
        //   type: 'grade',
        // },
        // {
        //   id: 2,
        //   label: 'Alphabétique',
        //   type: 'alphabetique',
        // },
        // {
        //   id: 2,
        //   label: 'Date de naissance',
        //   type: 'date',
        // },
        // {
        //   id: 2,
        //   label: 'Civilité',
        //   type: 'civilite',
        // },
        // {
        //   id: 2,
        //   label: 'Exercices',
        //   type: 'exercice',
        // },
      ],
    };
  },
  computed: {
    ...mapState({
      groups: (state) => state.groupe.listeWithSapeurs,
      sapeurs: (state) => state.sapeur.liste,
    }),
    groupeTree() {
      const groupFilter = (pereId) => (g) => g.pere_id == pereId;
      const sapeurMapping = (s) => {
        const sapeur = this.sapeurs.find((sapeur) => sapeur.id === s.id) || {nom: 'Ancien', prenom:'Sapeur', civilite: 1}
        return {
          label: `${sapeur.nom} ${sapeur.prenom}`,
          type: sapeur.civilite ? 'homme': 'femme',
        }
      }
      const groupeMapping = (g) => ({
        label: g.no ? `${g.no} ${g.designation}` : g.designation,
        type: g.type == 0 ? 'groupe' : 'groupe-inter',
        children: () => [
          ...this.groups.filter(groupFilter(g.id)).map(groupeMapping),
          ...g.sapeurs.map(sapeurMapping)
        ],
      });

      return this.groups.filter(groupFilter(null)).map(groupeMapping);
    },
  },
  methods: {
    name() {},
  },
};
</script>

<style lang="scss" scoped></style>
