<template>
  <table class="table table-sm table-hover table-striped">
    <thead>
      <tr>
        <th>
          <input
            type="checkbox"
            class="form-check-input"
            :checked="Object.values(selectedIds.type).every((m) => m)"
            @change="toggleAll($event)"
          />
        </th>
        <th>Designation</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="computedData.length <= 0">
        <td colspan="2">Aucune catégorie</td>
      </tr>
      <tr
        v-for="item in computedData"
        :key="item.globalId"
        :class="{
          'table-primary': item.globalId === selectedId,
        }"
      >
        <td>
          <input
            :id="item.id"
            v-model="selectedIds[item.type][item.id]"
            type="checkbox"
            class="form-check-input"
            @change="select(item, $event)"
          />
        </td>
        <td :style="{ 'padding-left': item.level * 25 + 'px' }">
          <font-awesome-icon class="me-2 ms-2" :icon="['fas', item.tag]" />
          {{ item.designation }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'MaterielTypeCategorieSelect',
  emits: ['change'],
  data() {
    return {
      selectedId: '',
      selectedIds: {
        categorie: {},
        type: {},
      },
    };
  },
  computed: {
    ...mapState({
      types: (state) =>
        state.matPersoType.liste.sort((a, b) => a.designation - b.designation),
      categories: (state) =>
        state.matPersoCategorie.liste.sort(
          (a, b) => a.designation - b.designation
        ),
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
    this.types.forEach((t) => (this.selectedIds.type[t.id] = true));
    this.categories.forEach((c) => (this.selectedIds.categorie[c.id] = true));
    this.$emit('change', this.selectedIds);
  },
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    toggleAll(event) {
      const selected = event.target.checked;

      this.types.forEach((t) => (this.selectedIds.type[t.id] = selected));
      this.categories.forEach(
        (c) => (this.selectedIds.categorie[c.id] = selected)
      );
    },
    select(item, event) {
      const selected = event.target.checked;

      const categorieIds = new Set([item.id]);
      this.computedData.forEach((e) => {
        if (e.type === 'categorie' && categorieIds.has(parseInt(e.pere_id))) {
          categorieIds.add(e.id);
          this.selectedIds.categorie[e.id?.toString()] = selected;
        }
        if (e.type === 'type' && categorieIds.has(e.materiel_categorie_id)) {
          this.selectedIds.type[e.id] = selected;
        }
      });
      this.$emit('change', this.selectedIds);
    },
  },
};
</script>

<style scoped></style>
