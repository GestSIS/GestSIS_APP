<script setup>
import { computed, reactive, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal.js';
import { useUniteStore } from '../../stores/common/Unite.js';
import { useTravailTypeStore } from '../../stores/travail/TravailType.js';
import { useSapeurStore } from '../../stores/sapeur/Sapeur.js';
import { useTravailStore } from '../../stores/travail/Travail.js';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const uniteStore = useUniteStore();
const travailTypeStore = useTravailTypeStore();
const sapeurStore = useSapeurStore();

const errors = ref({});
const form = reactive({
  exercice_comptable_id: null,
  ...data,
  sapeurs: [
    { sapeur_id: data?.sapeur_id ?? null, quantite: data?.quantite ?? null },
  ],
});
const initialQuantite = ref(data.quantite);

const unites = computed(() => uniteStore.liste);
const travailTypes = computed(() => travailTypeStore.liste);
const sapeurs = computed(() => sapeurStore.liste.filter((s) => s.actif));

const { closeModal } = useModalStore();

const review = (accepte) => {
  useTravailStore()
    .reviewTravail({ ...form, accepte })
    .then(closeModal)
    .catch((err) => (errors.value = err));
};
</script>

<template>
  <form @submit.prevent="review(true)">
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">Revue du travail</h5>
      <button type="button" class="btn-close" @click="closeModal()"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="form.travail_type_id"
        class="mb-3"
        :options="travailTypes"
        label="Travail"
        disabled
      />
      <div class="mb-3">
        <label for="designation">Désignation</label>
        <input
          id="designation"
          v-model="form.designation"
          type="text"
          class="form-control form-control-sm"
          disabled
        />
      </div>
      <div class="row">
        <div class="col-6">
          <div class="mb-3">
            <label for="date">Date</label>
            <input
              id="date"
              v-model="form.date"
              type="date"
              class="form-control form-control-sm"
              disabled
            />
          </div>
        </div>
        <div class="col-6">
          <base-select
            v-model="form.sapeur_id"
            class="mb-3"
            label="Sapeur"
            display-key="nom_prenom"
            :options="sapeurs"
            disabled
          />
        </div>
      </div>
      <label for="quantite">Quantité</label>
      <div class="input-group input-group-sm mb-3">
        <input
          id="quantite"
          v-model="form.quantite"
          name="quantite"
          type="number"
          step=".01"
          min="0"
          class="form-control form-control-sm"
        />
        <span class="input-group-text">
          {{
            unites.find(
              (u) =>
                u.id ==
                travailTypes.find((t) => t.id == form.travail_type_id)
                  ?.type_unite_id,
            )?.unite
          }}</span
        >
      </div>
      <div class="row">
        <div class="col-6">
          <base-select
            v-model="form.auteur_id"
            class="mb-3"
            label="Saisie par"
            display-key="nom_prenom"
            :options="sapeurs"
            disabled
          />
        </div>
        <div class="col-6">
          <div class="mb-3">
            <label for="date">Le</label>
            <input
              id="date"
              v-model="form.date_demande"
              type="date"
              class="form-control form-control-sm"
              disabled
            />
          </div>
        </div>
      </div>
      <div class="mb-3">
        <label for="justification">Justification</label>
        <textarea
          id="justification"
          v-model="form.justification"
          autofocus
          class="form-control form-control-sm"
          placeholder="(optionnel)"
          :required="initialQuantite != form.quantite"
        ></textarea>
        <label v-if="initialQuantite != form.quantite" class="text-danger"
          ><em
            >Quantité modifiée, justifiez ce changement pour plus de
            transparence</em
          ></label
        >
      </div>

      <div class="row">
        <div class="col-6">
          <button type="submit" class="btn btn-primary col-12">Accepter</button>
        </div>
        <div class="col-6">
          <button
            type="button"
            class="btn btn-danger col-12"
            @click="review(false)"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button
        type="button"
        class="btn btn-outline-secondary"
        @click="closeModal()"
      >
        Annuler
      </button>
    </div>
  </form>
</template>
