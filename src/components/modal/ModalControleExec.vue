<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useControleStore } from "../../stores/materiel/Controle.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useNotification from "../../composables/useNotification.js";
import ControleExecService from "../../services/materiel/ControleExecService.js";
import { toLocalIsoDate } from "../../tools/index.js";

const { data, callback } = defineProps({
  data: { type: Object, default: () => {} },
  callback: { type: Function, default: () => {} },
});

const awn = useNotification();
const { closeModal } = useModalStore();

const controleStore = useControleStore();
await controleStore.fetchControles();

const controlesApplicables = computed(() =>
  controleStore.liste.filter((c) =>
    c.materiel_types?.some((mt) => mt.materiel_type_id === data.materiel_type_id),
  ),
);

const errors = ref({});
const saving = ref(false);

const form = reactive({
  controle_id: controlesApplicables.value[0]?.id ?? null,
  executed_at: toLocalIsoDate(),
  remarque_globale: "",
});

const controle = computed(() => controlesApplicables.value.find((c) => c.id === form.controle_id));

const recurrenceLabel = (type) => {
  if (type === "PERIODIQUE") return "Périodique";
  if (type === "NON_PERIODIQUE") return "Non périodique";
  return "Après usage";
};

const buildResultat = (tache) => ({
  tache_id: tache.id,
  statut: "",
  value_measured: "",
  remarque: "",
});

const resultats = ref(controle.value ? controle.value.taches.map(buildResultat) : []);
watch(controle, (c) => {
  resultats.value = c ? c.taches.map(buildResultat) : [];
});

const tacheParId = computed(() =>
  Object.fromEntries((controle.value?.taches ?? []).map((t) => [t.id, t])),
);

const horsPlage = (resultat) => {
  const tache = tacheParId.value[resultat.tache_id];
  if (!tache || tache.type !== "NUMERIC" || resultat.value_measured === "") {
    return false;
  }
  const value = Number(resultat.value_measured);
  if (tache.value_min !== null && value < tache.value_min) return true;
  if (tache.value_max !== null && value > tache.value_max) return true;
  return false;
};

const save = async () => {
  errors.value = {};
  saving.value = true;

  const payload = {
    executed_at: form.executed_at,
    trigger_type: controle.value.recurrence_type,
    remarque_globale: form.remarque_globale || null,
    taches: resultats.value.map((r) => ({
      tache_id: r.tache_id,
      statut: r.statut || null,
      value_measured: r.value_measured !== "" ? Number(r.value_measured) : null,
      remarque: r.remarque || null,
    })),
  };

  try {
    await ControleExecService.creerExec(form.controle_id, data.id, payload);
    awn.success("Contrôle enregistré");
    closeModal();
    callback();
  } catch (err) {
    errors.value = err ?? {};
    awn.alert(err?.message ?? "Erreur lors de l'enregistrement du contrôle");
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">Contrôler {{ data.numero || data.designation }}</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>

    <div class="modal-body">
      <div v-if="controlesApplicables.length === 0" class="alert alert-warning mb-0">
        Aucun contrôle n'est configuré pour ce type de matériel.
      </div>
      <template v-else>
        <div class="row mb-3">
          <div class="col-md-6">
            <base-select
              v-model="form.controle_id"
              label="Contrôle"
              :required="true"
              :options="controlesApplicables"
              display-key="nom"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Exécuté le <span class="text-danger">*</span></label>
            <input
              v-model="form.executed_at"
              type="date"
              required
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['executed_at'] }"
            />
          </div>
          <div v-if="controle" class="col-md-3 d-flex align-items-end">
            <span class="badge bg-secondary">{{ recurrenceLabel(controle.recurrence_type) }}</span>
          </div>
        </div>

        <template v-if="controle">
          <div v-for="resultat in resultats" :key="resultat.tache_id" class="card mb-2">
            <div class="card-body py-2 px-3">
              <div class="row g-2 align-items-start">
                <div class="col-4">
                  <strong>{{ tacheParId[resultat.tache_id].nom }}</strong>
                  <div v-if="tacheParId[resultat.tache_id].description" class="text-muted small">
                    {{ tacheParId[resultat.tache_id].description }}
                  </div>
                </div>
                <div v-if="tacheParId[resultat.tache_id].type === 'BOOLEAN'" class="col-3">
                  <select v-model="resultat.statut" class="form-select form-select-sm">
                    <option value="" disabled>Résultat</option>
                    <option value="OK">OK</option>
                    <option value="NOK">NOK</option>
                    <option value="NA">NA</option>
                  </select>
                </div>
                <template v-else>
                  <div class="col-3">
                    <input
                      v-model="resultat.value_measured"
                      type="number"
                      step="any"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': horsPlage(resultat) }"
                      :placeholder="tacheParId[resultat.tache_id].unit || ''"
                    />
                    <div class="form-text">
                      <template
                        v-if="
                          tacheParId[resultat.tache_id].value_min !== null ||
                          tacheParId[resultat.tache_id].value_max !== null
                        "
                      >
                        Plage : {{ tacheParId[resultat.tache_id].value_min ?? "—" }} à
                        {{ tacheParId[resultat.tache_id].value_max ?? "—" }}
                        {{ tacheParId[resultat.tache_id].unit }}
                      </template>
                    </div>
                  </div>
                </template>
                <div class="col-5">
                  <input
                    v-model="resultat.remarque"
                    type="text"
                    class="form-control form-control-sm"
                    :placeholder="
                      resultat.statut === 'NOK' || horsPlage(resultat)
                        ? 'Remarque (obligatoire)'
                        : 'Remarque (optionnel)'
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="mb-0">
            <label class="form-label">Remarque globale</label>
            <textarea
              v-model="form.remarque_globale"
              class="form-control form-control-sm"
              rows="2"
            ></textarea>
          </div>
        </template>
      </template>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button
        v-if="controle"
        type="button"
        class="btn btn-primary"
        :disabled="saving"
        @click="save"
      >
        Enregistrer
      </button>
    </div>
  </div>
</template>
