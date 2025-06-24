<script setup>
import { useStore } from 'vuex';
import permissions from '/src/store/permissions.js';
import { useMesInfosStore } from '../../stores/mesinfos/MesInfos';
import { computed, inject, ref } from 'vue';
import { useModalStore } from '../../stores/common/Modal';

const { callback, data } = defineProps({
  callback: {
    type: Function,
    default: () => {},
  },
  data: {
    type: Object,
    default: () => {},
  },
});

const store = useStore();
const infosStore = useMesInfosStore();
const awn = inject('awn');

const errors = ref({});
const excuses = ref(data.exercices);
const excuse = data.exercices.find((e) => e.exercice_id === data.exerciceId);
const activeExcuse = ref({
  excuse_statut: 0,
  justification: '',
  justificatif_file: null,
  remarque: excuse?.remarque ?? '',
  exercice_id: excuse?.exercice_id ?? 0,
  justification: excuse?.justification ?? 0,
  excuse_type_id: excuse?.excuse_type_id ?? 0,
});

const excuseParams = computed(() => store.state.excuseParam.params);
const excuseTypes = computed(() =>
  store.state.excuseType.liste.filter((e) => e.statut == 1),
);

const activeExercice = computed(() =>
  excuses.value.find((e) => e.exercice_id === activeExcuse.value.exercice_id),
);

const { closeModal } = useModalStore();
const estDansLeDelai = (date) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  var delay = new Date(date);
  delay.setDate(delay.getDate() + excuseParams.value.delai_excuse);
  return now <= delay;
};
const estDejaExcuse = (exercice) => {
  return !!exercice.excuse_type_id;
};
const estAnnule = (exercice) => {
  return exercice.statut === 0;
};
const onFileChange = (event) => {
  const files = event.target.files || event.dataTransfer.files;
  if (!files.length) return;
  activeExcuse.value.justificatif_file = files[0];
};
const validate = () => {
  if (
    !activeExcuse.value.exercice_id ||
    estAnnule(activeExercice.value) ||
    estDejaExcuse(activeExercice.value) ||
    !estDansLeDelai(activeExercice.value?.date)
  ) {
    closeModal();
    awn.warning('Excuse non-enregistrée');
    return;
  }

  infosStore
    .addMonExcuse(activeExcuse.value)
    .then(() => {
      awn.success('Excuse enregistrée');
      closeModal();
    })
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message ?? "Erreur lors de la création de l'excuse");
    });
};
const close = () => {
  closeModal();
  awn.warning('Excuse non enregistrée');
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 id="exampleModalLabel" class="modal-title">S'excuser</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="activeExcuse.exercice_id"
        class="mb-3"
        :class="{
          'is-invalid': errors['exercice_id'],
        }"
        :options="excuses"
        :formatter="
          (e) =>
            new Date(e.date).toLocaleDateString('fr-CH').slice(0, 10) +
            ' - ' +
            e.categorie +
            ' (' +
            e.designation +
            ')'
        "
        value-key="exercice_id"
        label="Exercice"
      />
      <template v-if="!activeExcuse.exercice_id">
        <p class="text-warning">Sélectionnez un exercice</p>
      </template>
      <template v-else-if="estAnnule(activeExercice)">
        <p class="text-warning">Exercice annulé</p>
      </template>
      <template v-else-if="estDejaExcuse(activeExercice)">
        <p class="text-success">Excuse déjà saisie</p>
      </template>
      <template v-else-if="!estDansLeDelai(activeExercice?.date)">
        <p class="text-warning">
          Délai d'excuse ({{ excuseParams.delai_excuse }}
          jours) dépassé pour cet exercice !
        </p>
      </template>
      <template v-else>
        <base-select
          v-model="activeExcuse.excuse_type_id"
          class="mb-3"
          :class="{ 'is-invalid': errors['excuse_type_id'] }"
          :options="excuseTypes"
          label="Excuse type"
        />
        <div class="mb-3">
          <label for="remarque">Raison</label>
          <textarea
            id="remarque"
            v-model="activeExcuse.remarque"
            required
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['remarque'] }"
          ></textarea>
          <div v-if="errors['remarque']" class="invalid-feedback">
            Trop long
          </div>
        </div>
        <div class="mb-3">
          <label>Justificatif</label>
          <input
            ref="file-justificatif"
            type="file"
            class="form-control form-control-sm"
            accept="application/pdf"
            @change="onFileChange"
          />
        </div>
      </template>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline-primary" @click="validate">Valider</button>
      <button class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </div>
</template>
<style scoped></style>
