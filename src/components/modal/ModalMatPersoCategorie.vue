<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} une catégorie
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="activeItem.designation"
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <base-select
        v-model="activeItem.pere_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['pere_id'] }"
        label="Catégorie parente"
        display-key="fullDesignation"
        :options="computedCategories"
      />
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="HIDE_MODAL()">
        Fermer
      </button>
      <button type="button" class="btn btn-primary" @click="save()">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

export default {
  name: 'ModalMateriel',
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      errors: {},
      eventTypeIds: {},
      activeItem: {},
    };
  },
  computed: {
    ...mapState({
      categories: (state) =>
        state.matPersoCategorie.liste.sort(
          (a, b) => a.designation - b.designation
        ),
    }),
    computedCategories() {
      let indexedCategories = {};
      this.categories.forEach((c) => {
        if (!indexedCategories[c.pere_id]) indexedCategories[c.pere_id] = [c];
        else indexedCategories[c.pere_id].push(c);
      });

      let data = [];

      const recursive = (categories, prefix) => {
        categories.forEach((c) => {
          if (c.id === this.activeItem.id) return;
          data.push({
            ...c,
            fullDesignation: prefix + c.designation,
          });
          if (indexedCategories[c.id])
            recursive(indexedCategories[c.id], prefix + c.designation + ' > ');
        });
      };

      recursive(
        this.categories.filter((c) => !c.pere_id),
        ''
      );
      return data;
    },
  },
  mounted() {
    this.activeItem = {
      ...this.activeItem,
      ...this.data,
    };
  },
  methods: {
    ...mapMutations(['HIDE_MODAL']),
    async save() {
      this.$store
        .dispatch(
          (this.activeItem.id || 0) === 0
            ? 'addMatPersoCategorie'
            : 'updateMatPersoCategorie',
          this.activeItem
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
