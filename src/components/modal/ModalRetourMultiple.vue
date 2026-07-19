<script setup>
import { toLocalIsoDate } from "../../tools/index.js";
import { computed, reactive, ref } from "vue";
import { useModalStore } from "../../stores/common/Modal.js";

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const errors = ref({});
const all = ref(true);
const form = reactive({
  date: toLocalIsoDate(),
  ...data,
});
const selected = ref(Object.fromEntries(data.map((m) => [m.id, true])));

// FIXME: a réimplémenter
const types = computed(() => store.state.matPersoType.liste);

const { closeModal } = useModalStore();

const toggleAll = (value) => {
  selected.value = Object.fromEntries(data.map((e) => [e.id, value]));
};

const save = () => {
  store
    .dispatch("retourMatPerso", {
      date: form.date,
      materielIds: Object.entries(selected.value)
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    })
    .then(() => {
      store.dispatch("fetchMatPersoARecuperer");
      closeModal();
    })
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">Retour matériel</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <div class="mb-3">
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
      <div class="mb-3">
        <!-- <label>Matériel retourné</label> -->
        <table class="table table-sm table-striped">
          <thead>
            <tr>
              <th>
                <input
                  v-model="all"
                  type="checkbox"
                  class="form-check-input"
                  @change="toggleAll($event.target.checked)"
                />
              </th>
              <th>Matériel</th>
              <th>Quantité</th>
              <th>Taille</th>
              <th>Numéro</th>
              <th>Remarque</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in data" :key="item.id" :class="{ 'table-primary': selected[item.id] }">
              <td>
                <input
                  :id="item.id"
                  v-model="selected[item.id]"
                  type="checkbox"
                  class="form-check-input"
                />
              </td>
              <td>
                {{ types.find((e) => e.id === item.materiel_type_id)?.designation }}
              </td>
              <td>{{ item.materiel?.quantite ?? 1 }}</td>
              <td>{{ item.taille }}</td>
              <td>{{ item.materiel?.numero }}</td>
              <td>{{ item.remarque }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">Fermer</button>
      <button type="submit" class="btn btn-primary">Valider</button>
    </div>
  </form>
</template>
