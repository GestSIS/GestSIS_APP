<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Sélection des localités</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <div class="row mb-2">
        <div class="col-6 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Localités sélectionnés ({{ chosen.length }})</h6>
          <button
            class="btn btn-outline-danger"
            :disabled="!canRemoveSelected"
            @click="removeSelected"
          >
            Enlever ces localités
          </button>
        </div>
        <div class="col-6 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Localités disponibles</h6>
          <button
            class="btn btn-outline-primary"
            :disabled="!canAddSelected"
            @click="addSelected"
          >
            Ajouter ces localités
          </button>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th></th>
                <th>Npa</th>
                <th>Localité</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="chosen.length <= 0">
                <td colspan="4">Aucune localité sélectioné</td>
              </tr>
              <tr
                v-for="item in chosen"
                :key="item"
                :class="{
                  'table-primary': selected[item],
                }"
              >
                <td class="text-center">
                  <div class="form-check d-inline-block ps-0">
                    <input
                      :id="item"
                      v-model="selected[item]"
                      type="checkbox"
                      class="form-check-input ms-0"
                      @click="select(item)"
                    />
                    <label class="form-check-label" :for="item"></label>
                  </div>
                </td>
                <td>{{ indexedLocalite[item]?.npa }}</td>
                <td>{{ indexedLocalite[item]?.designation }}</td>
                <td>
                  <button
                    class="btn btn-outline-danger border-0"
                    @click="removeLocalite(item)"
                  >
                    <font-awesome-icon :icon="['far', 'trash-alt']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-6">
          <table class="table table-sm table-striped">
            <thead>
              <tr>
                <th></th>
                <th>Npa</th>
                <th>Designation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="availableLocalites.length == 0">
                <td v-if="localites.length > 0" colspan="3">
                  Toutes les localités sont déjà sélectionnées
                </td>
                <td v-if="localites.length == 0" colspan="3">
                  Aucune localité de disponible dans GestSIS, veuillez prendre
                  contact avec l'administrateur de GestSIS
                </td>
              </tr>
              <tr
                v-for="item in availableLocalites"
                :key="item.id"
                :class="{ 'table-primary': selected[item.id] }"
              >
                <td>
                  <div class="form-check d-inline-block">
                    <input
                      :id="item.id"
                      v-model="selected[item.id]"
                      type="checkbox"
                      class="form-check-input"
                      @click="select(item.id)"
                    />
                    <label class="form-check-label" :for="item.id"></label>
                  </div>
                </td>
                <td>{{ item.npa }}</td>
                <td>{{ item.designation }}</td>
                <td>
                  <button
                    class="btn btn-outline-primary border-0"
                    @click="addLocalite(item.id)"
                  >
                    <font-awesome-icon :icon="['fas', 'plus']" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-primary" @click="save">Enregistrer</button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

//TODO:
// - Par fonction -> effectif et non principale
// - Par cours
// - Date anniversaire
// - Permis de conduire

export default {
  name: 'ModalLocaliteSelect',
  props: {
    callback: {
      type: Function,
      default: () => {},
    },
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      groupBy: 'groupe',
      chosen: [],
      selected: {},
    };
  },
  computed: {
    ...mapState({
      localites: (state) => state.localite.liste,
    }),
    availableLocalites() {
      const indexedChosen = this.chosen.reduce((acc, l) => {
        acc[l] = l;
        return acc;
      }, {});
      return this.localites.filter((l) => !indexedChosen[l.id]);
    },
    indexedLocalite() {
      return this.localites.reduce((acc, l) => {
        acc[l.id] = l;
        return acc;
      }, {});
    },
    canAddSelected() {
      const indexedChosen = this.chosen.reduce((acc, l) => {
        acc[l] = l;
        return acc;
      }, {});
      return (
        Object.entries(this.selected).find(
          ([l, selected]) => selected && !indexedChosen[l]
        ) != null
      );
    },
    canRemoveSelected() {
      return this.chosen.find((l) => this.selected[l]) != null;
    },
  },
  mounted() {
    this.chosen = this.data.ids.slice(0);
    this.$store.dispatch('fetchLocalites');
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    close() {
      (this.callback(null) ?? Promise.resolve()).then((close) => {
        if (close ?? true) {
          this.HIDE_MODAL();
        }
      });
    },
    async save() {
      // Sapeurs ajoutés
      const newLoc = this.chosen.filter((s) => !this.data.ids.includes(s));
      // Sapeurs supprimés
      const removedLoc = this.data.ids.filter((s) => !this.chosen.includes(s));
      // Sapeurs tous
      const localites = this.chosen;

      const svm = this;
      this.callback({ ajoute: newLoc, supprime: removedLoc, tous: localites })
        .then((close) => {
          if (close ?? true) {
            svm.HIDE_MODAL();
          }
        })
        .catch((errorMessage) => {
          svm.$awn.warning(errorMessage);
        });
    },
    select(id) {
      this.selected[id] = true;
    },
    addLocalite(id) {
      this.chosen = [...this.chosen, id];
    },
    removeLocalite(id) {
      this.chosen = this.chosen.filter((l) => l != id);
    },
    addSelected() {
      this.chosen = Array.from(
        new Set([
          ...this.chosen,
          ...Object.entries(this.selected)
            .filter(([, selected]) => selected)
            .map(([id]) => parseInt(id)),
        ])
      );
    },
    removeSelected() {
      this.chosen = this.chosen.filter((id) => !this.selected[id]);
    },
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
