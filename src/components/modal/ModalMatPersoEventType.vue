<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeEvent.id ? 'Modifier' : 'Ajouter' }} événement type
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="nom">Nom</label>
        <input
          id="nom"
          v-model="activeEvent.nom"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['nom'] }"
        />
      </div>
      <div class="mb-3">
        <label for="description">Description</label>
        <input
          id="description"
          v-model="activeEvent.description"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['description'] }"
        />
      </div>
      <div class="mb-3 form-check">
        <input
          id="materiel-validable-modal"
          v-model="activeEvent.validable"
          type="checkbox"
          class="form-check-input"
        />
        <label class="form-check-label" for="materiel-validable-modal"
          >Validable</label
        >
      </div>
      <div class="mb-3">
        <label for="seuil_min">Matériel type</label>
        <table class="table table-sm table-hover table-striped">
          <thead>
            <tr>
              <th></th>
              <th>Designation</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="computedData.length <= 0">
              <td colspan="3">Aucune catégorie</td>
            </tr>
            <tr v-for="item in computedData" :key="item.globalId">
              <td class="text-center">
                <input
                  v-model="selectedIds[item.type][item.id]"
                  type="checkbox"
                  class="form-check-input"
                  @change="select(item, $event)"
                />
              </td>
              <td :style="{ 'padding-left': item.level * 25 + 'px' }">
                <font-awesome-icon
                  class="me-2 ms-2"
                  :icon="['fas', item.tag]"
                />
                {{ item.designation }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeEvent.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalMatPersoEventType',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      materielTypeIds: {},
      activeEvent: {
        validable: false,
      },
      selectedIds: {
        type: {},
        categorie: {},
      },
    };
  },
  computed: {
    ...mapState({
      categories: (state) =>
        state.matPersoCategorie.liste.sort(
          (a, b) => a.designation - b.designation
        ),
      types: (state) =>
        state.matPersoType.liste.sort((a, b) => a.designation - b.designation),
    }),
    computedData() {
      let indexedTypes = {};
      this.types.forEach((t) => {
        if (!indexedTypes[t.materiel_categorie_id])
          indexedTypes[t.materiel_categorie_id] = [t];
        else indexedTypes[t.materiel_categorie_id].push(t);
      });
      let indexedCategories = {};
      this.categories.forEach((c) => {
        if (!indexedCategories[c.pere_id]) indexedCategories[c.pere_id] = [c];
        else indexedCategories[c.pere_id].push(c);
      });

      let data = [];

      const recursive = (categories, level) => {
        categories.forEach((c) => {
          data.push({
            ...c,
            globalId: 'c' + c.id,
            type: 'categorie',
            level: level,
            tag: 'tag',
          });

          if (indexedCategories[c.id])
            recursive(indexedCategories[c.id], level + 1);

          indexedTypes[c.id]?.forEach((t) => {
            data.push({
              ...t,
              globalId: 't' + t.id,
              type: 'type',
              level: level + 1,
              tag: 'shirt',
            });
          });
        });
      };

      recursive(
        this.categories.filter((c) => !c.pere_id),
        0
      );
      return data;
    },
  },
  mounted() {
    this.activeEvent = {
      ...this.activeEvent,
      ...this.data,
    };

    this.types.forEach((t) => (this.selectedIds.type[t.id] = false));
    this.categories.forEach((t) => (this.selectedIds.categorie[t.id] = false));
    this.data?.materiel_types?.forEach(
      (a) => (this.selectedIds.type[a.id] = true)
    );
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    select(item, event) {
      const selected = event.target.checked;

      const categorieIds = new Set(item.type === 'categorie' ? [item.id] : []);
      this.computedData.forEach((e) => {
        if (e.type === 'categorie' && categorieIds.has(parseInt(e.pere_id))) {
          categorieIds.add(e.id);
          this.selectedIds.categorie[e.id?.toString()] = selected;
        }
        if (e.type === 'type' && categorieIds.has(e.materiel_categorie_id)) {
          this.selectedIds.type[e.id] = selected;
        }
      });
    },
    async save() {
      this.activeEvent.materielTypeIds = Object.entries(this.selectedIds.type)
        .filter(([, value]) => value)
        .map(([key]) => key);
      this.$store
        .dispatch(
          (this.activeEvent.id || 0) === 0
            ? 'addMatPersoEventType'
            : 'updateMatPersoEventType',
          this.activeEvent
        )
        .then(() => {
          this.errors = {};
          this.HIDE_MODAL();
        })
        .catch(
          (errors) =>
            (this.errors = {
              ...errors,
            })
        );
    },
  },
};
</script>

<style scoped></style>
