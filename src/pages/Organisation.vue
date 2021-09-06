<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-6">
        <ol class="breadcrumb bg-white">
          <li class="breadcrumb-item">
            <router-link tag="a" :to="{ name: 'accueil' }">Accueil</router-link>
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
            <groupe-affichage v-if="false" @selected="selected" />
            <groupe-edition
              :editMode="editMode"
              @selected="selected"
              ref="groupeEdition"
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
            <button class="btn btn-primary" @click="expand">
              Tout développer
            </button>
            <button class="btn btn-primary" @click="contract">
              Tout réduire
            </button>
            <button class="btn btn-primary" @click="editMode = !editMode">
              {{ editMode ? 'Mode affichage' : 'Mode édition' }}
            </button>
          </div>
          <div v-if="editMode" class="card-body pt-0">
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveLeft,
                'btn-secondary': !canMoveLeft,
              }"
              @click.prevent="left"
              :disabled="!canMoveLeft"
            >
              ←
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveRight,
                'btn-secondary': !canMoveRight,
              }"
              @click.prevent="right"
              :disabled="!canMoveRight"
            >
              →
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveUp,
                'btn-secondary': !canMoveUp,
              }"
              @click.prevent="up"
              :disabled="!canMoveUp"
            >
              ↑
            </button>
            <button
              class="btn btn-sm"
              :class="{
                'btn-primary': canMoveDown,
                'btn-secondary': !canMoveDown,
              }"
              @click.prevent="down"
              :disabled="!canMoveDown"
            >
              ↓
            </button>
          </div>
          <div v-else class="card-body pt-0">
            <button
              class="btn btn-primary mb-2"
              :disabled="
                !(
                  !!active &&
                  (active.data.type == 'groupe' ||
                    active.data.type == 'groupeInter')
                )
              "
              @click="addSapeurs(active)"
            >
              Ajouter/enlever des sapeurs
            </button>
          </div>
        </div>
        <div
          class="card card-primary card-outline mt-2"
          v-if="editMode && active && groupesTypes.includes(active.data.type)"
        >
          <div class="card-header d-flex justify-content-between">
            <h3>Modifier</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label for="abreviation">No</label>
              <input
                type="text"
                v-model="groupeEdit.no"
                class="form-control"
                :class="{ 'is-invalid': errors['no'] }"
                id="no"
              />
            </div>
            <div class="form-group">
              <label for="abreviation">Nom</label>
              <input
                type="text"
                v-model="groupeEdit.designation"
                class="form-control"
                :class="{ 'is-invalid': errors['designation'] }"
                id="designation"
              />
            </div>
            <div class="form-group">
              <label for="abreviation">Info</label>
              <input
                type="text"
                v-model="groupeEdit.info"
                class="form-control"
                :class="{ 'is-invalid': errors['info'] }"
                id="info"
              />
            </div>
            <div class="form-group">
              <label for="cours-precedent">Groupe parent</label>
              <select
                id="pere_id"
                v-model="groupeEdit.pere_id"
                class="custom-select"
              >
                <option :value="null">-</option>
                <option v-for="g in filteredGroupes" :key="g.id" :value="g.id">
                  {{ (g.no ? g.no + ' ' : '') + g.designation }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <div class="custom-control custom-checkbox">
                <input
                  type="checkbox"
                  class="custom-control-input"
                  id="type"
                  v-model="groupeEdit.type"
                  :true-value="1"
                  :false-value="0"
                />
                <label class="custom-control-label" for="type"
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
      groupeEdit: {},
      editMode: false,
      groupesTypes: ['groupe', 'groupeInter'],
      errors: {},
    };
  },
  computed: {
    ...mapState({
      groupes: (state) => state.groupe.liste.filter((g) => g.actif),
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
    save() {
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
          this.errorsData = { ...errors };
          this.$awn.alert(
            error.message || 'Erreur lors de la modification du groupe'
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
    addSapeurs(node) {
      if (!this.groupesTypes.includes(node.data.type)) {
        return;
      }
      const id = node.data.id;
      const groupe = this.groupes.find((g) => g.id == id);
      const data = groupe.sapeur_ids.map((s) => s.sapeur_id).slice(0);

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
