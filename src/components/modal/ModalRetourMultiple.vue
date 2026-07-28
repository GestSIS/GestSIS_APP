<script setup>
import { toLocalIsoDate, indexedData, groupedByData } from "../../tools/index.js";
import { computed, reactive, ref, watch } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type";
import ArticleService from "../../services/materiel/ArticleService";
import SelectEmplacement from "../materiel/SelectEmplacement.vue";
import useNotification from "../../composables/useNotification.js";

const { data, callback } = defineProps({
  data: {
    type: Array,
    default: () => [],
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const awn = useNotification();
const errors = ref({});
const emplacement_id = ref(null);
const emplacementsMultiples = ref(false);
const form = reactive({
  date: toLocalIsoDate(),
});

const materielTypeStore = useMaterielTypeStore();
await materielTypeStore.fetchMaterielTypes();
const indexedTypes = computed(() => indexedData(materielTypeStore.liste));

const selected = ref(Object.fromEntries(data.map((article) => [article.id, true])));
const allSelected = computed(() => data.every((article) => selected.value[article.id]));
const toggleAll = (value) => {
  selected.value = Object.fromEntries(data.map((article) => [article.id, value]));
};

const articleEmplacements = ref(Object.fromEntries(data.map((article) => [article.id, null])));
watch(emplacementsMultiples, (multiple) => {
  if (multiple) {
    articleEmplacements.value = Object.fromEntries(
      data.map((article) => [
        article.id,
        articleEmplacements.value[article.id] ?? emplacement_id.value,
      ]),
    );
  }
});

const { closeModal } = useModalStore();
const save = () => {
  const articleIds = Object.entries(selected.value)
    .filter(([, isSelected]) => isSelected)
    .map(([id]) => id);

  if (articleIds.length === 0) {
    awn.warning("Veuillez sélectionner au moins un matériel à retourner");
    return;
  }

  if (!emplacementsMultiples.value) {
    if (!emplacement_id.value) {
      errors.value = { emplacement: ["Veuillez sélectionner un emplacement"] };
      return;
    }

    return ArticleService.retourArticles(emplacement_id.value, {
      date: form.date,
      articleIds,
    })
      .then(() => {
        callback();
        closeModal();
      })
      .catch((err) => (errors.value = err));
  }

  const articleIdsParEmplacement = Object.entries(
    groupedByData(
      articleIds.map((id) => ({ id, emplacement_id: articleEmplacements.value[id] })),
      "emplacement_id",
    ),
  );

  if (articleIdsParEmplacement.some(([emplacementId]) => emplacementId === "null")) {
    errors.value = { emplacement: ["Veuillez sélectionner un emplacement pour chaque matériel"] };
    return;
  }

  return Promise.all(
    articleIdsParEmplacement.map(([emplacementId, articles]) =>
      ArticleService.retourArticles(emplacementId, {
        date: form.date,
        articleIds: articles.map((a) => a.id),
      }),
    ),
  )
    .then(() => {
      callback();
      closeModal();
    })
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Retour de matériel</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>
    <div class="modal-body">
      <div class="row">
        <div class="col-6 mb-3">
          <label for="date">Date du retour</label>
          <input
            id="date"
            v-model="form.date"
            required
            type="date"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['attributions.0.date'] }"
          />
        </div>
        <div v-if="!emplacementsMultiples" class="col-6 mb-3">
          <select-emplacement
            v-model="emplacement_id"
            label="Emplacement"
            :class="{ 'is-invalid': errors['emplacement'] }"
          />
          <div v-if="errors['emplacement']" class="invalid-feedback d-block">
            {{ errors["emplacement"][0] }}
          </div>
        </div>
        <div class="col-md-12 mb-3">
          <div class="form-check form-switch">
            <input
              id="switch-mode-retour"
              v-model="emplacementsMultiples"
              class="form-check-input"
              type="checkbox"
              role="switch"
            />
            <label class="form-check-label" for="switch-mode-retour"
              >Retourner à plusieurs emplacements différents
            </label>
          </div>
        </div>
      </div>
      <table class="table table-sm table-striped">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                class="form-check-input"
                :checked="allSelected"
                @change="toggleAll($event.target.checked)"
              />
            </th>
            <th>N°</th>
            <th>Matériel type</th>
            <th>Taille</th>
            <th>Remarque</th>
            <th v-if="emplacementsMultiples">Emplacement</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="article in data"
            :key="article.id"
            :class="{ 'table-primary': selected[article.id] }"
          >
            <td>
              <input v-model="selected[article.id]" type="checkbox" class="form-check-input" />
            </td>
            <td>{{ article.numero }}</td>
            <td>{{ indexedTypes[article.materiel_type_id]?.designation }}</td>
            <td>{{ article.taille }}</td>
            <td>{{ article.remarque }}</td>
            <td v-if="emplacementsMultiples">
              <select-emplacement
                v-model="articleEmplacements[article.id]"
                :class="{ 'is-invalid': errors['emplacement'] }"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="emplacementsMultiples && errors['emplacement']" class="invalid-feedback d-block">
        {{ errors["emplacement"][0] }}
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="submit" class="btn btn-primary">Valider</button>
    </div>
  </form>
</template>
