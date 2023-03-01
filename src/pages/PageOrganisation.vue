<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb m-3">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'accueil' }">Accueil</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">
            Organisation
          </li>
        </ol>
      </div>
      <div class="col-sm-6 d-flex justify-content-end">
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
            <groupe-edition
              ref="groupeEdition"
              :edit-mode="editMode"
              @selected="selected"
            />
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card card-primary card-outline">
          <div class="card-header d-flex justify-content-between">
            <h3>Actions</h3>
          </div>
          <div class="card-body pb-2">
            <button
              v-tooltip.top="'Tout développer'"
              class="btn btn-info me-1"
              @click="expand"
            >
              <font-awesome-icon :icon="['far', 'plus-square']" />
            </button>
            <button
              v-tooltip.top="'Tout réduire'"
              class="btn btn-info me-1"
              @click="contract"
            >
              <font-awesome-icon :icon="['far', 'minus-square']" />
            </button>
            <button
              v-tooltip.top="editMode ? 'Mode affichage' : 'Mode édition'"
              class="btn btn-info me-1"
              @click="editMode = !editMode"
            >
              <font-awesome-icon :icon="['far', editMode ? 'eye' : 'edit']" />
            </button>
          </div>
          <div v-if="!editMode" class="card-body pt-0">
            <button
              class="btn btn-primary mb-2"
              :disabled="!activeIsGroupe"
              @click="addSapeurs(active)"
            >
              Ajouter/enlever des sapeurs
            </button>
          </div>
          <div v-if="editMode" class="card-body pt-0">
            <button class="btn btn-primary d-block mb-2" @click="addGroupe">
              Ajouter un groupe
            </button>
            <button
              class="btn btn-primary d-block mb-2"
              :disabled="!activeIsGroupe"
              @click="deleteGroupe"
            >
              Supprimer
            </button>
          </div>
          <div v-if="editMode" class="card-body pt-0">
            <h3>Réorganiser le groupe</h3>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveLeft,
                'btn-secondary': !canMoveLeft,
              }"
              :disabled="!canMoveLeft"
              @click.prevent="left"
            >
              ←
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveRight,
                'btn-secondary': !canMoveRight,
              }"
              :disabled="!canMoveRight"
              @click.prevent="right"
            >
              →
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveUp,
                'btn-secondary': !canMoveUp,
              }"
              :disabled="!canMoveUp"
              @click.prevent="up"
            >
              ↑
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveDown,
                'btn-secondary': !canMoveDown,
              }"
              :disabled="!canMoveDown"
              @click.prevent="down"
            >
              ↓
            </button>
          </div>
        </div>
        <div
          v-if="editMode && active && groupesTypes.includes(active.data.type)"
          class="card card-primary card-outline mt-2"
        >
          <div class="card-header d-flex justify-content-between">
            <h3>Modifier</h3>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label for="abreviation">No</label>
              <input
                id="no"
                v-model="groupeEdit.no"
                type="number"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['no'] }"
              />
            </div>
            <div class="mb-3">
              <label for="abreviation">Nom</label>
              <input
                id="designation"
                v-model="groupeEdit.designation"
                type="text"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['designation'] }"
              />
            </div>
            <base-select
              v-model="groupeEdit.pere_id"
              class="mb-3"
              label="Groupe parent"
              base-option="-"
              :base-value="null"
              display-key="label"
              :options="filteredGroupes"
            />
            <div class="mb-3">
              <div class="form-check">
                <input
                  id="type"
                  v-model="groupeEdit.type"
                  type="checkbox"
                  class="form-check-input"
                  :true-value="1"
                  :false-value="0"
                />
                <label class="form-check-label" for="type"
                  >Groupe d'alarme</label
                >
              </div>
            </div>
            <button class="btn btn-primary" @click="save">Modifier</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import store from '/src/store/index';

import GroupeEdition from '../components/groupe/GroupeEdition.vue';
import ExerciceComptable from '../components/exercice_comptable/ExerciceComptable.vue';

async function loadData(routeTo, next) {
  const loadSapeurs = store.dispatch('fetchListeSapeur');
  const loadGroupes = store.dispatch('fetchGroupes');

  Promise.all([loadSapeurs, loadGroupes]).then(() => {
    next();
  });
}

export default {
  name: 'PageOrganisation',
  components: {
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
      groupeEdit: {},
      editMode: false,
      groupesTypes: ['groupe', 'groupeInter'],
      errors: {},
    };
  },
  computed: {
    ...mapState({
      groupes: (state) =>
        state.groupe.liste.map((g) => ({
          ...g,
          label: (g.no ? g.no + ' ' : '') + g.designation,
        })),
      sapeurs: (state) => state.sapeur.liste,
    }),
    filteredGroupes() {
      const activeId = this.active?.data?.id || 0;
      if (activeId) {
        const rec = (groupeId) => {
          // Retourne la liste des ids des groupes enfants
          const children = this.groupes.filter((g) => g.pere_id == groupeId);
          return children.flatMap((g) => [g.id, ...rec(g.id)]);
        };
        const filteredIds = new Set([activeId, ...rec(activeId)]);
        return this.groupes.filter((g) => !filteredIds.has(g.id));
      } else {
        return [];
      }
    },
    activeIsGroupe() {
      return (
        (!!this.active &&
          (this.active.data.type == 'groupe' ||
            this.active.data.type == 'groupeInter')) ||
        false
      );
    },
    canMoveDown() {
      return (
        (this.groupesTypes.includes(this.active?.data?.type) &&
          !this.active?.isLast) ||
        false
      );
    },
    canMoveUp() {
      return (
        (this.groupesTypes.includes(this.active?.data?.type) &&
          !this.active?.isFirst) ||
        false
      );
    },
    canMoveLeft() {
      return (
        (this.groupesTypes.includes(this.active?.data?.type) &&
          !this.active?.isRoot) ||
        false
      );
    },
    canMoveRight() {
      return (
        (this.groupesTypes.includes(this.active?.data?.type) &&
          !this.active?.isFirstOfLevel) ||
        false
      );
    },
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    contract() {
      this.$refs.groupeEdition.contract();
    },
    expand() {
      this.$refs.groupeEdition.expand();
    },
    selected(elem) {
      this.active = elem;
      if (this.groupesTypes.includes(elem.data.type)) {
        this.groupeEdit = { ...this.groupes.find((g) => g.id == elem.data.id) };
      } else {
        this.groupeEdit = {};
      }
    },
    async save() {
      this.$store
        .dispatch('updateGroupe', {
          groupeId: this.groupeEdit.id,
          data: {
            ...this.groupeEdit,
          },
        })
        .then(() => {
          this.$awn.success('Groupe modifié avec succès');
        })
        .catch((errors) => {
          this.errors = { ...errors };
          this.$awn.alert(
            errors.message || 'Erreur lors de la modification du groupe'
          );
        });
    },
    up() {
      this.$refs.groupeEdition.up(this.active);
    },
    down() {
      this.$refs.groupeEdition.down(this.active);
    },
    right() {
      this.$refs.groupeEdition.right(this.active);
    },
    left() {
      this.$refs.groupeEdition.left(this.active);
    },
    deleteGroupe() {
      if (this.activeIsGroupe) {
        this.SHOW_MODAL({
          component: 'ModalConfirmation',
          data: {
            title: 'Voulez-vous vraiment supprimer ce groupe ?',
            question:
              "Attention, la suppression du groupe entraînera la suppression de tous les sous-groupes. Cette action n'est pas réversible !",
          },
          callback: (confirmed) => {
            if (confirmed) {
              this.$store.dispatch('deleteGroupe', this.active.data.id);
            }
          },
        });
      } else {
        this.$awn.warning(
          'Sélectionnez un groupe afin de pouvoir le supprimer.'
        );
      }
    },
    addGroupe() {
      this.SHOW_MODAL({
        component: 'ModalGroupe',
      });
    },
    addSapeurs(node) {
      if (!this.groupesTypes.includes(node.data.type)) {
        return;
      }
      const id = node.data.id;
      const groupe = this.groupes.find((g) => g.id == id);
      const data = {
        ids: groupe.sapeur_ids.map((s) => s.sapeur_id).slice(0),
      };

      const svm = this;
      const callback = (res) => {
        if (!res) {
          return;
        }
        const { tous } = res;
        return svm.$store.dispatch('updateGroupeSapeurs', {
          groupeId: id,
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
