<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ activeItem.id ? 'Modifier' : 'Ajouter' }} une catégorie
      </h5>
      <button type="button" class="btn-close" @click="HIDE_MODAL()"></button>
    </div>
    <div class="modal-body row">
      <div class="col-6">
        <div class="mb-3">
          <label for="categorie">Matériel type</label>
          <select
            id="categorie"
            :value="activeItem.pere_id"
            class="form-select form-select-sm"
            :class="{ 'is-invalid': errors['pere_id'] }"
            disabled
          >
            <option :value="null">-</option>
            <option v-for="c in eventTypes" :key="c.id" :value="c.id">
              {{ c.fullDesignation }}
            </option>
          </select>
        </div>
        <div class="mb-3">
          <label for="designation">Numéro</label>
          <input
            id="designation"
            v-model="activeItem.designation"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['designation'] }"
            disabled
          />
        </div>
        <div class="mb-3">
          <label for="designation">Taille</label>
          <input
            id="designation"
            v-model="activeItem.designation"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['designation'] }"
            disabled
          />
        </div>
        <div class="mb-3">
          <label for="designation">Remarque</label>
          <input
            id="designation"
            v-model="activeItem.designation"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['designation'] }"
          />
        </div>
      </div>
      <div class="col-6">
        <base-table
          :data="activeItem.events"
          :fields="fields"
          :selectable="true"
          no-data="Aucun événement"
        />
      </div>
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
      fields: [
        {
          title: 'Date',
          field: 'date',
          type: 'date',
        },
        {
          title: 'Événements',
          field: 'type',
        },
        {
          title: 'Remarque',
          field: 'remarque',
        },
        {
          title: 'Succès',
          field: 'succes',
        },
        {
          title: '',
          key: 'details',
          slot: 'details',
          dataClass: 'details-width',
        },
      ],
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
      eventTypes: (state) =>
        state.matPersoEventType.liste.sort(
          (a, b) => a.designation - b.designation
        ),
    }),
  },
  mounted() {
    this.activeItem = {
      ...this.activeItem,
      ...this.data,
      events: this.data?.materiel?.events.map((e) => ({ ...e })),
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
