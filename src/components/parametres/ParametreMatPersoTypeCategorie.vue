<template>
  <div class="card card-primary card-outline">
    <div class="card-header d-flex justify-content-between">
      <h3 class="card-title me-auto">Catégories et type de matériel</h3>
      <button
        type="button"
        class="btn btn-primary me-2"
        @click="ajoutCategorie"
      >
        Ajouter une catégorie
      </button>
      <button
        type="button"
        class="btn btn-primary"
        :selectable="true"
        @click="ajoutType"
      >
        Ajouter un type de matériel
      </button>
    </div>
    <div class="card-body table-responsive p-0">
      <table class="table table-sm table-hover">
        <thead>
          <tr>
            <th>Designation</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="computedData.length <= 0">
            <td colspan="3">Aucune catégorie</td>
          </tr>
          <tr
            v-for="item in computedData"
            :key="item.globalId"
            :class="{
              'table-primary': item.globalId === selectedId,
            }"
            @click="select(item)"
          >
            <td :style="{ 'padding-left': item.level * 25 + 'px' }">
              <font-awesome-icon class="me-2 ms-2" :icon="['fas', item.tag]" />
              {{ item.designation }}
            </td>
            <td>
              <button
                type="button"
                class="btn btn-outline-primary border-0"
                @click="update(item)"
              >
                <font-awesome-icon :icon="['far', 'edit']" />
              </button>
              <button
                type="button"
                class="btn btn-outline-danger border-0"
                @click="remove(item)"
              >
                <font-awesome-icon :icon="['far', 'trash-alt']" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  name: 'ParametreMatPersoTypeCategorie',
  data() {
    return {
      selectedId: null,
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
  methods: {
    ...mapMutations(['SHOW_MODAL']),
    select(item) {
      this.selectedId = item?.globalId;
    },
    ajoutCategorie() {
      this.SHOW_MODAL({ component: 'ModalMatPersoCategorie', data: {} });
    },
    ajoutType() {
      this.SHOW_MODAL({ component: 'ModalMatPersoType', data: {} });
    },
    update(elem) {
      this.SHOW_MODAL({
        component:
          elem.type == 'type' ? 'ModalMatPersoType' : 'ModalMatPersoCategorie',
        data: { ...elem },
      });
    },
    remove(elem) {
      this.$store
        .dispatch(
          elem.type === 'type'
            ? 'removeMatPersoType'
            : 'removeMatPersoCategorie',
          elem.id
        )
        .catch((res) =>
          this.$awn.alert(res.message || 'Erreur lors de la suppression')
        );
    },
  },
};
</script>

<style scoped></style>
