<script setup>
import { computed, inject, ref } from 'vue';
import { useStore } from 'vuex';
import { useModalStore } from '../../stores/common/Modal.js';
import MultiStep from '../base/MultiStep.vue';

const { data } = defineProps({
  data: {
    type: Object,
    default: () => {},
  },
});

const phase = ref(1);
const detailsTypes = ref(false);
const ecritures = ref([]);

const store = useStore();

const fonctions = computed(() => store.state.fonction.liste);
const fraisIndemniteAnnuel = computed(
  () => store.state.imputation.fraisIndemnites.annuels,
);
const comptes = computed(() => store.state.compte.liste);
const sapeurs = computed(() => store.state.sapeur.liste);
const typesAnnuel = computed(() => {
  return [
    ...fraisIndemniteAnnuel.value.map((f) => ({
      ...f,
      fonctions: f.frais_indemnite_annuels || [],
    })),
  ];
});
const filteredFonctions = computed(() => {
  const fonctionIds = new Set(
    typesAnnuel.value.flatMap((t) => t.fonctions.map((f) => f.fonction_id)),
  );
  return fonctions.value.filter((f) => fonctionIds.has(f.id));
});

const { closeModal } = useModalStore();
const awn = inject('awn');

const montantAnnuelTypePourFonction = (type, fonction) => {
  const elem = type.fonctions?.find((e) => e.fonction_id == fonction.id);
  return elem?.quantite * elem?.montant || '';
};
const compte = (id) => {
  if (!id) {
    return '';
  }
  const compte = comptes.value.find((f) => f.id === id);
  return `${compte?.numero} ${compte?.designation}`;
};
const cancel = () => {
  closeModal();
};
const imputer = () => {
  store
    .dispatch('imputerAnnuel')
    .then((data) => {
      phase.value = 2;
      ecritures.value = [...data].sort((e1, e2) => e2.sapeur_id - e1.sapeur_id);
    })
    .catch((err) =>
      awn.alert(err?.message ?? "Impossible d'effectuer cette action"),
    );
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">
        Imputer indemnités et frais annuels
      </h5>
      <button type="button" class="btn-close" @click="cancel"></button>
    </div>
    <div class="modal-body">
      <multi-step
        :steps="['Type de frais', 'Résultat']"
        :active-index="phase - 1"
      />
      <div v-if="phase === 1" class="alert alert-dismissible alert-primary">
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="alert"
        ></button>
        <h4 class="alert-heading">Aide</h4>
        <p class="mb-0">
          Les frais et indemnités annuels ci-dessous seront imputés
          automatiquement pour
          <strong>chaque</strong> sapeur selon ses fonctions. Pour effectuer
          l'imputation, cliquez sur le bouton <strong>Imputer</strong> en bas de
          la fenêtre.
        </p>
      </div>
      <div v-if="phase === 1" class="row">
        <div class="col-12">
          <table id="frais-annuels" class="table table-sm">
            <thead>
              <tr>
                <th></th>
                <th
                  v-for="type in typesAnnuel"
                  :key="type.id + '-' + type.type"
                  class="text-center"
                >
                  {{ type.designation }}
                </th>
              </tr>
              <tr>
                <th>Compte</th>
                <td
                  v-for="type in typesAnnuel"
                  :key="type.id + '-' + type.type"
                  class="text-center"
                >
                  {{ compte(type.compte_id) }}
                </td>
              </tr>
              <tr>
                <th>Cumulable</th>
                <td
                  v-for="type in typesAnnuel"
                  :key="type.id + '-' + type.type"
                  class="text-center"
                >
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :checked="type.cumulable"
                    disabled
                  />
                </td>
              </tr>
            </thead>
            <tbody>
              <tr v-for="fonction in filteredFonctions" :key="fonction.id">
                <td>{{ fonction.nom }}</td>
                <td
                  v-for="type in typesAnnuel"
                  :key="type.id + '-' + type.type"
                  class="text-end"
                >
                  <template v-if="!detailsTypes">{{
                    montantAnnuelTypePourFonction(type, fonction)
                  }}</template>
                  <template v-if="detailsTypes">{{
                    montantAnnuelTypePourFonctionDetails(type, fonction)
                  }}</template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="phase === 2">
        <div class="alert alert-dismissible alert-success">
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="alert"
          ></button>
          Imputations effectuées avec
          <strong>succès</strong>!
        </div>
        <table class="table table-sm">
          <thead>
            <tr>
              <th>Sapeur</th>
              <th>Designation</th>
              <th>Tarif</th>
              <th>Quantité</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ecriture in ecritures" :key="ecriture.id">
              <td>
                {{
                  sapeurs.find((s) => s.id == ecriture.sapeur_id)?.nom_prenom
                }}
              </td>
              <td>{{ ecriture.designation }}</td>
              <td class="text-end">{{ ecriture.tarif }}</td>
              <td class="text-end">{{ ecriture.quantite }}</td>
              <td class="text-end">{{ ecriture.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal()">
        {{ phase === 1 ? 'Annuler' : 'Fermer' }}
      </button>
      <button
        v-if="phase === 1"
        type="button"
        class="btn btn-primary"
        @click="imputer()"
      >
        Imputer
      </button>
    </div>
  </div>
</template>
