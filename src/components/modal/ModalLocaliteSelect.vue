<script setup>
import { computed, ref } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useLocaliteStore } from "../../stores/common/Localite.js";
import { useModalStore } from "../../stores/common/Modal.js";

const { callback, data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
  callback: {
    type: Function,
    default: () => {},
  },
});

const localiteStore = useLocaliteStore();
localiteStore.fetchLocalites();

const chosen = ref(data.ids.map((l) => l).slice(0));
const selected = ref({});

const localites = computed(() => localiteStore.liste);

const availableLocalites = computed(() => {
  const indexedChosen = chosen.value.reduce((acc, l) => {
    acc[l] = l;
    return acc;
  }, {});
  return localites.value.filter((l) => !indexedChosen[l.id]);
});
const indexedLocalite = computed(() => {
  return localites.value.reduce((acc, l) => {
    acc[l.id] = l;
    return acc;
  }, {});
});
const canAddSelected = computed(() => {
  const indexedChosen = chosen.value.reduce((acc, l) => {
    acc[l] = l;
    return acc;
  }, {});
  return (
    Object.entries(selected.value).find(([l, selected]) => selected && !indexedChosen[l]) != null
  );
});
const canRemoveSelected = computed(() => {
  return chosen.value.find((l) => selected.value[l]) != null;
});

const { closeModal } = useModalStore();
const awn = useNotification();

const close = () => {
  (callback(null) ?? Promise.resolve()).then((close) => {
    if (close ?? true) {
      closeModal();
    }
  });
};
const save = () => {
  // Localités ajoutés
  const newLoc = chosen.value.filter((s) => !data.ids.includes(s));
  // Localités supprimés
  const removedLoc = data.ids.filter((s) => !chosen.value.includes(s));
  // Localités tous
  const localites = chosen.value;

  callback({ ajoute: newLoc, supprime: removedLoc, tous: localites })
    .then((close) => {
      if (close ?? true) {
        closeModal();
      }
    })
    .catch((errorMessage) => {
      awn.warning(errorMessage);
    });
};
const select = (id) => {
  selected.value[id] = true;
};
const addLocalite = (id) => {
  chosen.value = [...chosen.value, id];
};
const removeLocalite = (id) => {
  chosen.value = chosen.value.filter((l) => l != id);
};
const addSelected = () => {
  chosen.value = Array.from(
    new Set([
      ...chosen.value,
      ...Object.entries(selected.value)
        .filter(([, selected]) => selected)
        .map(([id]) => parseInt(id)),
    ]),
  );
};
const removeSelected = () => {
  chosen.value = chosen.value.filter((id) => !selected.value[id]);
};
</script>

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
            type="button"
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
            type="button"
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
                    type="button"
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
                  Aucune localité de disponible dans GestSIS, veuillez prendre contact avec
                  l'administrateur de GestSIS
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
                    type="button"
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
      <button type="button" class="btn btn-outline-primary" @click="save">Enregistrer</button>
      <button type="button" class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
