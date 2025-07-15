<script setup>
import { computed, reactive, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useStore } from 'vuex';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const form = reactive({
  actif: 1,
  abreviation: '',
  ...data,
});

const store = useStore();
const grades = computed(() => store.state.grade.liste);
const fonctions = computed(() =>
  store.state.fonction.liste.filter((f) => f.actif),
);
const cours = computed(() => store.state.cours.liste);

const { closeModal } = useModalStore();

const save = async () => {
  store
    .dispatch(form?.id ? 'updateCours' : 'addCours', form)
    .then(closeModal)
    .catch(
      (err) =>
        (errors.value = {
          ...err,
        }),
    );
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        {{ form.id ? 'Modifier' : 'Ajouter' }} un cours
      </h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
        <label for="tri">Tri</label>
        <input
          id="tri"
          v-model="form.tri"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['tri'] }"
        />
      </div>
      <div class="mb-3">
        <label for="abreviation">Abréviation</label>
        <input
          id="abreviation"
          v-model="form.abreviation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['abreviation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="form.designation"
          required
          type="text"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
        />
      </div>
      <div class="mb-3">
        <label for="duree">Durée</label>
        <div class="input-group">
          <input
            id="duree"
            v-model="form.duree"
            required
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['duree'] }"
          />
          <span class="input-group-text">jours</span>
        </div>
      </div>
      <base-select
        v-model="form.precedent_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['precedent_id'] }"
        :options="cours"
        label="Cours précédent"
        base-option="-"
        :base-value="null"
      />
      <base-select
        v-model="form.grade_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['grade_id'] }"
        :options="grades"
        label="Grade"
        base-option="-"
        :base-value="null"
      />
      <base-select
        v-model="form.fonction_id"
        class="mb-3"
        :class="{ 'is-invalid': errors['fonction_id'] }"
        :options="fonctions"
        display-key="nom"
        label="Fonction"
        base-option="-"
        :base-value="null"
      />
      <div class="mb-3">
        <label for="validite_debut">Validité début</label>
        <input
          id="validite_debut"
          v-model="form.validite_debut"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['validite_debut'] }"
        />
      </div>
      <div class="mb-3">
        <label for="validite_fin">Validité fin</label>
        <input
          id="validite_fin"
          v-model="form.validite_fin"
          type="date"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['validite_fin'] }"
        />
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        Fermer
      </button>
      <button type="submit" class="btn btn-primary">
        {{ form.id ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </form>
</template>
