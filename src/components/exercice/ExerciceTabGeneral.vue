<script setup>
import { computed, inject, ref, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import permissions from '/src/store/permissions.js';
import useHasPermission from '../../hooks/usePermission.js';

const { id } = defineProps({
  id: {
    type: String,
    default: 'new',
  },
});

const errors = ref({});
const form = ref({
  lieu: '',
  communications: '',
});

const store = useStore();

store.dispatch('fetchListeSapeur');
store.dispatch('fetchLocalites');
store.dispatch('fetchExerciceCategories');
store.dispatch('fetchExercicesComptables');

const loading = ref(false);
watchEffect(async () => {
  loading.value = true;
  await store.dispatch('fetchExercice', id);
  form.value = {
    exercice_categorie_id: null,
    ...store.state.exercice.active.data,
    heure: store.state.exercice.active.data?.heure?.slice(0, 5),
  };
  loading.value = false;
});

const categories = computed(() => store.state.exerciceCategorie.liste);
const localites = computed(() => store.state.localite.liste);
const hasEditPermission = useHasPermission(permissions.EXERCICE.MODIFICATION);

watchEffect(() => {
  if (id === 'new') {
    form.value.duree = categories.value.find(
      (e) => e.id == form.value.exercice_categorie_id,
    )?.duree_base;
  }
});

const router = useRouter();
const awn = inject('awn');

const save = () =>
  store
    .dispatch(
      (form.value.id || 0) === 0 ? 'createExercice' : 'saveExercice',
      form.value,
    )
    .then((data) => {
      if (id === 'new') {
        router.push('/exercices/' + data.id);
      }
      errors.value = {};
      awn.success(data?.message || 'Exercice créé');
    })
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message || "Erreur lors de l'enregistrement");
    });
</script>

<template>
  <form class="card card-primary card-outline" @submit.prevent="save">
    <div class="card-header d-flex justify-content-between">
      <span></span>
      <button
        v-if="hasEditPermission"
        type="submit"
        class="btn btn-outline-primary"
      >
        {{ (form.id || 0) === 0 ? 'Ajouter' : 'Sauvegarder' }}
      </button>
    </div>
    <div class="card-body">
      <div class="mb-3">
        <label for="m-exe-des">Designation</label>
        <input
          id="m-exe-des"
          v-model="form.designation"
          required
          type="text"
          :readonly="!hasEditPermission"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['designation'] }"
          name="nom"
        />
      </div>
      <base-select
        v-model="form.exercice_categorie_id"
        label="Catégorie"
        :options="categories"
        :disabled="!hasEditPermission"
        :required="true"
        class="mb-3"
        :select-class="{ 'is-invalid': errors['exercice_categorie_id'] }"
      />
      <div class="row">
        <div class="col-6">
          <div class="mb-3">
            <label for="m-exe-date">Date</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'calendar-alt']" />
              </div>
              <input
                id="m-exe-date"
                v-model="form.date"
                type="date"
                required
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['date'] }"
                name="nom"
              />
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="mb-3">
            <label for="m-exe-heure">Heure de début</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['far', 'clock']" />
              </div>
              <input
                id="m-exe-heure"
                v-model="form.heure"
                type="time"
                required
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['heure'] }"
                name="nom"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <div class="mb-3">
            <label for="m-exe-duree">Durée</label>
            <div class="input-group input-group-sm">
              <div class="input-group-text">
                <font-awesome-icon :icon="['fas', 'hourglass-end']" />
              </div>
              <input
                id="m-exe-duree"
                v-model="form.duree"
                type="number"
                required
                :readonly="!hasEditPermission"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': errors['duree'] }"
                min="1"
                max="780"
                name="duree"
              />
              <span class="input-group-text">min</span>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-6">
          <base-select
            v-model="form.localite_id"
            label="Localité"
            :options="localites"
            :disabled="!hasEditPermission"
            :required="true"
            :select-class="{ 'is-invalid': errors['localite_id'] }"
            class="mb-3"
          />
        </div>
        <div class="col-6">
          <div class="mb-3">
            <label for="m-exe-lieu">Lieu</label>
            <input
              id="m-exe-lieu"
              v-model="form.lieu"
              type="text"
              :readonly="!hasEditPermission"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['lieu'] }"
              name="nom"
            />
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label for="m-sap-communication">Communications</label>
        <textarea
          id="m-sap-communication"
          v-model="form.communications"
          type="text"
          :readonly="!hasEditPermission"
          class="form-control form-control-sm"
          :class="{ 'is-invalid': errors['communications'] }"
          name="communications"
        ></textarea>
      </div>
    </div>
  </form>
</template>
