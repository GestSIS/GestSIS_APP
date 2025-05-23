<script setup>
import { computed } from 'vue';
import { useMaterielTypeStore } from '../../stores/materiel/Type';
import { useModalStore } from '../../stores/common/Modal';

const { id } = defineProps({
  id: {
    type: String,
    required: true,
  },
});

const materielTypeStore = useMaterielTypeStore();

await Promise.all([materielTypeStore.fetchMaterielTypes()]);

const materielType = computed(() =>
  materielTypeStore.liste.find((m) => m.id === parseInt(id)),
);

const formatEmptyString = (str) => (str === '' ? '-' : str);

const { showModal } = useModalStore();
const editMateriel = () =>
  showModal({
    component: 'ModalMaterielType',
    data: { ...materielType.value },
  });
</script>

<template>
  <div class="card mb-2">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="m-0">Description du matériel</h5>
      <button
        type="button"
        class="btn btn-primary btn-sm"
        @click="editMateriel"
      >
        <font-awesome-icon :icon="['far', 'edit']" />
      </button>
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col-6">
          <div class="row">
            <div class="col-3">Nom</div>
            <div class="col-9">{{ materielType.designation }}</div>
          </div>
          <div class="row">
            <div class="col-3">Prix</div>
            <div class="col-9">{{ materielType.prix }}</div>
          </div>
          <div class="row">
            <div class="col-3">Fournisseur</div>
            <div class="col-9">
              {{ formatEmptyString(materielType.fournisseur) }}
            </div>
          </div>
          <div class="row">
            <div class="col-3">Réparateur</div>
            <div class="col-9">
              {{ formatEmptyString(materielType.reparateur) }}
            </div>
          </div>
          <div class="row">
            <div class="col-3">Remarque</div>
            <div class="col-9">
              {{ formatEmptyString(materielType.remarque) }}
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              disabled
              :checked="materielType.est_taillee"
            />
            <label class="form-check-label"> Est taillé </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              disabled
              :checked="materielType.est_attribuable"
            />
            <label class="form-check-label"> Est attribuable </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              disabled
              :checked="materielType.est_numerote"
            />
            <label class="form-check-label"> Est numéroté </label>
          </div>
          <div class="row">
            <div class="col-3">
              Préfixe
              <font-awesome-icon
                v-tooltip.bottom="{
                  content: 'Préfixe pour l\'étiquettage individuel',
                }"
                class="ms-1"
                :icon="['far', 'question-circle']"
              />
            </div>
            <div class="col-9">
              <span v-if="materielType.est_numerote">{{
                materielType.prefix === ''
                  ? 'Aucun préfixe'
                  : materielType.prefix
              }}</span>
              <span v-else>(Pas d'étiquettage individuel)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-check-input ~ .form-check-label {
  opacity: 1;
}
</style>
