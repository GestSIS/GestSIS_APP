<script setup>
import { useMesInfosStore } from "../../stores/mesinfos/MesInfos";
import { useExcuseParamStore } from "../../stores/exercice/ExcuseParam.js";
import { useExcuseTypeStore } from "../../stores/exercice/ExcuseType.js";
import { useAuthStore } from "../../stores/auth/Auth.js";
import { computed, ref, watch } from "vue";
import useNotification from "../../composables/useNotification.js";
import { useModalStore } from "../../stores/common/Modal";

const { callback, data } = defineProps({
  callback: {
    type: Function,
    default: () => Promise.resolve(),
  },
  data: {
    type: Object,
    default: () => {},
  },
});

const infosStore = useMesInfosStore();
const excuseParamStore = useExcuseParamStore();
const excuseTypeStore = useExcuseTypeStore();
const authStore = useAuthStore();
const awn = useNotification();

// N'affiche le nom du SIS dans le select que si le sapeur a un profil dans plusieurs SIS.
const sapeurDansPlusieursSis = computed(() => Object.keys(authStore.sis.sapeurs ?? {}).length > 1);

// Les exercices peuvent provenir de plusieurs SIS (ex. depuis Accueil) : exercice_id seul n'est pas
// unique dans ce cas (chaque SIS a sa propre séquence), donc on identifie chaque option par un
// couple (sis_key, exercice_id) plutôt que par exercice_id seul.
const excuses = ref(
  (data.exercices ?? []).map((e) => ({ ...e, uid: `${e.sis_key ?? ""}:${e.exercice_id}` })),
);
const initialExcuse = excuses.value.find(
  (e) => e.exercice_id === data.exerciceId && (data.sisKey == null || e.sis_key === data.sisKey),
);

const errors = ref({});
const selectedUid = ref(initialExcuse?.uid ?? "");
const activeExcuse = ref({
  excuse_statut: 0,
  justificatif_file: null,
  remarque: initialExcuse?.remarque ?? "",
  exercice_id: initialExcuse?.exercice_id ?? 0,
  justification: initialExcuse?.justification ?? "",
  excuse_type_id: initialExcuse?.excuse_type_id ?? 0,
});

const activeExercice = computed(() => excuses.value.find((e) => e.uid === selectedUid.value));

// Sis de l'exercice actuellement sélectionné dans le select : sinon on suit le SIS actif comme avant.
const sisKey = computed(() => activeExercice.value?.sis_key ?? data.sisKey ?? null);

watch(selectedUid, () => {
  activeExcuse.value.exercice_id = activeExercice.value?.exercice_id ?? 0;
});

const excuseParams = computed(
  () => data.excuseParamsBySis?.[sisKey.value] ?? data.excuseParams ?? excuseParamStore.params,
);
const excuseTypes = computed(() =>
  (data.excuseTypesBySis?.[sisKey.value] ?? data.excuseTypes ?? excuseTypeStore.liste).filter(
    (e) => e.statut == 1,
  ),
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
const estConvoque = (exercice) => {
  return !!exercice.convoque;
};
const onFileChange = (event) => {
  const files = event.target.files || event.dataTransfer.files;
  if (!files.length) return;
  activeExcuse.value.justificatif_file = files[0];
};
const validate = () => {
  if (
    !activeExcuse.value.exercice_id ||
    !activeExercice.value ||
    !excuseParams.value?.actif ||
    estAnnule(activeExercice.value) ||
    !estConvoque(activeExercice.value) ||
    estDejaExcuse(activeExercice.value) ||
    !estDansLeDelai(activeExercice.value?.date)
  ) {
    closeModal();
    awn.warning("Excuse non-enregistrée");
    return;
  }

  infosStore
    .addMonExcuse(activeExcuse.value, sisKey.value)
    .then(() => {
      awn.success("Excuse enregistrée");
      callback();
      closeModal();
    })
    .catch((err) => {
      errors.value = err;
      awn.alert(err?.message ?? "Erreur lors de la création de l'excuse");
    });
};
const close = () => {
  closeModal();
  awn.warning("Excuse non enregistrée");
};
</script>

<template>
  <form @submit.prevent="validate">
    <div class="modal-header">
      <h5 class="modal-title">S'excuser</h5>
      <button type="button" class="btn-close" @click="close"></button>
    </div>
    <div class="modal-body">
      <base-select
        v-model="selectedUid"
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
            ')' +
            (e.sis_nom && sapeurDansPlusieursSis ? ' [' + e.sis_nom + ']' : '')
        "
        value-key="uid"
        label="Exercice"
      />
      <template v-if="!activeExcuse.exercice_id">
        <p class="text-warning">Sélectionnez un exercice</p>
      </template>
      <template v-else-if="!excuseParams?.actif">
        <p class="text-danger">Les excuses via GestSIS ne sont pas activées pour ce SIS.</p>
      </template>
      <template v-else-if="estAnnule(activeExercice)">
        <p class="text-warning">Exercice annulé</p>
      </template>
      <template v-else-if="!estConvoque(activeExercice)">
        <p class="text-warning">
          Vous n'êtes pas convoqué à cet exercice, vous ne pouvez pas vous excuser.
        </p>
      </template>
      <template v-else-if="estDejaExcuse(activeExercice)">
        <p class="text-success">Excuse déjà saisie</p>
      </template>
      <template v-else-if="!estDansLeDelai(activeExercice?.date)">
        <p class="text-warning">
          Délai d'excuse ({{ excuseParams.delai_excuse }} jours) dépassé pour cet exercice !
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
          <div v-if="errors['remarque']" class="invalid-feedback">Trop long</div>
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
      <button type="submit" class="btn btn-outline-primary">Valider</button>
      <button type="button" class="btn btn-outline-secondary" @click="close">Annuler</button>
    </div>
  </form>
</template>
