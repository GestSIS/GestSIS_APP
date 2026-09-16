<script setup>
import { ref, reactive, watch, computed, nextTick, useTemplateRef } from "vue";
import { useControleStore } from "../../stores/materiel/Controle.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";
import { useModalStore } from "../../stores/common/Modal.js";
import useNotification from "../../composables/useNotification.js";

const { data } = defineProps({
  data: { type: Object, default: () => {} },
});

const materielTypeStore = useMaterielTypeStore();
await materielTypeStore.fetchMaterielTypes();

const store = useControleStore();
const { closeModal } = useModalStore();
const awn = useNotification();

const errors = ref({});
const saving = ref(false);

const form = reactive({
  id: data?.id ?? null,
  nom: data?.nom ?? "",
  description: data?.description ?? "",
  recurrence_type: data?.recurrence_type ?? "PERIODIQUE",
  recurrence_value: data?.recurrence_value ?? "",
  duree_preavis: data?.duree_preavis ?? "",
  nb_execution_max: data?.nb_execution_max ?? "",
  nb_execution_preavis: data?.nb_execution_preavis ?? "",
  externe: data?.externe ?? false,
  reparateur: data?.reparateur ?? "",
});

// Interrupteur dédié plutôt que de déduire l'activation depuis la seule
// présence de nb_execution_max : évite qu'une valeur laissée dans le champ
// (puis effacée par erreur) ne réactive silencieusement la limite.
const limiterExecutions = ref((data?.nb_execution_max ?? null) !== null);

watch(
  () => form.recurrence_type,
  () => {
    form.recurrence_value = "";
    form.duree_preavis = "";
    form.nb_execution_max = "";
    form.nb_execution_preavis = "";
    limiterExecutions.value = false;
  },
);

watch(limiterExecutions, (actif) => {
  if (!actif) {
    form.nb_execution_max = "";
    form.nb_execution_preavis = "";
  }
});

const resumeLimiteExecutions = computed(() => {
  if (!form.nb_execution_max) {
    return null;
  }
  if (form.nb_execution_preavis) {
    return `Avertissement dès la ${form.nb_execution_preavis}e exécution, invalide dès la ${form.nb_execution_max}e.`;
  }
  return `Invalide dès la ${form.nb_execution_max}e exécution.`;
});

// --- Mode monotâche / multitâche / sans tâche ---
// Une nouvelle fiche démarre en mode monotâche par défaut ; seule une fiche
// existante explicitement enregistrée sans tâche (ex: un lavage) rouvre en "sans".
const mode = ref(
  data?.id && (data?.taches?.length ?? 0) === 0
    ? "sans"
    : (data?.taches?.length ?? 0) > 1
      ? "multi"
      : "mono",
);

const switchMode = (newMode) => {
  if (newMode === "mono" && taches.value.length > 1) {
    taches.value = [taches.value[0]];
  }
  if (newMode !== "sans" && taches.value.length === 0) {
    taches.value = [buildTache()];
  }
  mode.value = newMode;
};

// --- Tâches ---
let nextKey = 1;
const mkKey = () => nextKey++;

const buildTache = (t) => ({
  _key: mkKey(),
  id: t?.id ?? null,
  order: t?.order ?? 1,
  nom: t?.nom ?? "",
  description: t?.description ?? "",
  type: t?.type ?? "BOOLEAN",
  unit: t?.unit ?? "",
  value_min: t?.value_min ?? "",
  value_max: t?.value_max ?? "",
});

const taches = ref(data?.taches?.length ? data.taches.map(buildTache) : [buildTache()]);

const monoTache = computed(() => taches.value[0]);

const tacheOrdreInputs = useTemplateRef("tache-ordre");

const addTache = () => {
  taches.value.push({ ...buildTache(), order: taches.value.length + 1 });
  nextTick(() => {
    tacheOrdreInputs.value[tacheOrdreInputs.value.length - 1]?.focus();
  });
};

const removeTache = (key) => {
  taches.value = taches.value.filter((t) => t._key !== key);
};

// --- Types de matériel ---
let typeKey = 0;
const mkTypeKey = () => ++typeKey;

const selectedTypes = ref(
  data?.materiel_types?.length
    ? data.materiel_types.map((mt) => ({
        _key: mkTypeKey(),
        materiel_type_id: mt.materiel_type_id,
      }))
    : [{ _key: mkTypeKey(), materiel_type_id: null }],
);

// Un même type de matériel ne doit pas pouvoir être sélectionné sur deux
// lignes : chaque ligne masque les types déjà choisis ailleurs, en gardant
// le sien propre visible.
const typesDejaChoisis = computed(
  () => new Set(selectedTypes.value.map((t) => t.materiel_type_id).filter((id) => id !== null)),
);
const optionsPourLigne = (rowData) =>
  materielTypeStore.liste.filter(
    (t) => t.id === rowData.materiel_type_id || !typesDejaChoisis.value.has(t.id),
  );

// Le ref="..." classique ne fonctionne pas ici : ce champ est rendu dans un
// slot scopé de base-table, dont le v-for vit dans le template de BaseTable.vue
// et non dans celui-ci. Vue ne peut donc pas détecter à la compilation que ce
// ref se répète (pas de collecte en tableau) — un ref-fonction, ciblé par clé
// de ligne, contourne le problème.
const typeSelectRefs = new Map();
const setTypeSelectRef = (key, el) => {
  if (el) {
    typeSelectRefs.set(key, el);
  } else {
    typeSelectRefs.delete(key);
  }
};

const addSelectedType = () => {
  const nouveauType = { _key: mkTypeKey(), materiel_type_id: null };
  selectedTypes.value.push(nouveauType);
  nextTick(() => {
    typeSelectRefs.get(nouveauType._key)?.focus();
  });
};
const removeSelectedType = (key) => {
  selectedTypes.value = selectedTypes.value.filter((t) => t._key !== key);
};

const fieldsTypes = [
  { key: "materiel_type_id", title: "Type de matériel", slot: "type-select" },
  { key: "_key", title: "", slot: "type-actions" },
];

// --- Save ---
const save = async () => {
  errors.value = {};
  saving.value = true;

  const payload = {
    nom: form.nom,
    description: form.description || null,
    recurrence_type: form.recurrence_type,
    recurrence_value:
      form.recurrence_type === "PERIODIQUE" && form.recurrence_value
        ? Number(form.recurrence_value)
        : null,
    duree_preavis:
      form.recurrence_type === "PERIODIQUE" && form.duree_preavis
        ? Number(form.duree_preavis)
        : null,
    nb_execution_max:
      form.recurrence_type !== "PERIODIQUE" && form.nb_execution_max
        ? Number(form.nb_execution_max)
        : null,
    nb_execution_preavis:
      form.recurrence_type !== "PERIODIQUE" && form.nb_execution_preavis
        ? Number(form.nb_execution_preavis)
        : null,
    externe: form.externe,
    reparateur: form.reparateur || null,
    taches:
      mode.value === "sans"
        ? []
        : taches.value.map((t) => ({
            ...(t.id ? { id: t.id } : {}),
            order: mode.value === "mono" ? 1 : t.order,
            nom: mode.value === "mono" ? form.nom : t.nom,
            description: mode.value === "mono" ? form.description || null : t.description || null,
            type: t.type,
            unit: t.type === "NUMERIC" ? t.unit || null : null,
            value_min: t.type === "NUMERIC" && t.value_min !== "" ? t.value_min : null,
            value_max: t.type === "NUMERIC" && t.value_max !== "" ? t.value_max : null,
          })),
    materiel_type_ids: selectedTypes.value
      .map((r) => r.materiel_type_id)
      .filter((id) => id !== null),
  };

  try {
    if (form.id) {
      await store.updateControle({ id: form.id, ...payload });
    } else {
      await store.addControle(payload);
    }
    closeModal();
  } catch (err) {
    errors.value = err ?? {};
    awn.alert(err?.message ?? "Erreur lors de l'enregistrement du contrôle");
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <form @submit.prevent="save">
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un contrôle</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>

    <div class="modal-body">
      <!-- Informations générales -->
      <div class="row mb-3">
        <div class="col-md-8">
          <label class="form-label">Nom <span class="text-danger">*</span></label>
          <input
            v-model="form.nom"
            type="text"
            required
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['nom'] }"
          />
          <div v-if="errors['nom']" class="invalid-feedback">
            {{ errors["nom"][0] }}
          </div>
        </div>
        <div class="col-md-4">
          <label class="form-label">Type de récurrence <span class="text-danger">*</span></label>
          <select v-model="form.recurrence_type" class="form-select form-select-sm">
            <option value="PERIODIQUE">Périodique</option>
            <option value="NON_PERIODIQUE">Non périodique</option>
          </select>
        </div>
      </div>

      <label>Récurrence</label>
      <fieldset class="border rounded p-3 mb-3">
        <div v-if="form.recurrence_type === 'PERIODIQUE'" class="row g-2">
          <div class="col-md-4">
            <label class="form-label">Fréquence (mois) <span class="text-danger">*</span></label>
            <input
              v-model="form.recurrence_value"
              type="number"
              required
              min="1"
              step="1"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['recurrence_value'] }"
              placeholder="Ex : 6"
            />
          </div>
          <div class="col-md-4">
            <label class="form-label">Préavis (mois)</label>
            <input
              v-model="form.duree_preavis"
              type="number"
              min="1"
              step="1"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['duree_preavis'] }"
              placeholder="Ex : 1"
            />
          </div>
        </div>

        <template v-else>
          <div class="form-check form-switch mb-0">
            <input
              id="controle-limiter-executions"
              v-model="limiterExecutions"
              class="form-check-input"
              type="checkbox"
              role="switch"
            />
            <label class="form-check-label" for="controle-limiter-executions">
              Limiter le nombre d'exécutions
            </label>
          </div>

          <div v-if="limiterExecutions" class="row g-2 mt-1">
            <div class="col-md-4">
              <label class="form-label"
                >Nombre d'exécutions maximum <span class="text-danger">*</span></label
              >
              <div class="input-group input-group-sm">
                <input
                  v-model="form.nb_execution_max"
                  type="number"
                  required
                  min="1"
                  step="1"
                  class="form-control"
                  :class="{ 'is-invalid': errors['nb_execution_max'] }"
                  placeholder="Ex : 10"
                />
                <span class="input-group-text">exécutions</span>
              </div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Préavis dès</label>
              <div class="input-group input-group-sm">
                <input
                  v-model="form.nb_execution_preavis"
                  type="number"
                  min="1"
                  :max="form.nb_execution_max || undefined"
                  step="1"
                  class="form-control"
                  :class="{ 'is-invalid': errors['nb_execution_preavis'] }"
                  placeholder="Ex : 8"
                />
                <span class="input-group-text">exécutions</span>
              </div>
            </div>
            <div class="col-md-4 d-flex align-items-end">
              <span v-if="resumeLimiteExecutions" class="text-muted small">
                {{ resumeLimiteExecutions }}
              </span>
            </div>
          </div>
          <p v-if="limiterExecutions" class="text-muted small mb-0 mt-2">
            Une fois ce nombre d'exécutions atteint, l'article sera considéré comme inutilisable
            (contrôle invalide), même sans tâche assignée.
          </p>
        </template>
      </fieldset>

      <label>Responsable</label>
      <fieldset class="border rounded p-3 pb-0 mb-3">
        <div class="row mb-3">
          <div class="col-md-3 d-flex align-items-center">
            <div class="form-check">
              <input
                id="controle-externe"
                v-model="form.externe"
                type="checkbox"
                class="form-check-input"
              />
              <label class="form-check-label" for="controle-externe">Contrôle externe</label>
            </div>
          </div>
          <div class="col-md-6">
            <label class="form-label">Responsable du contrôle</label>
            <input
              v-model="form.reparateur"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['reparateur'] }"
              placeholder="Ex : Chef mat, ou nom du mandataire externe"
            />
          </div>
        </div>
      </fieldset>

      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea
          v-model="form.description"
          class="form-control form-control-sm"
          rows="2"
        ></textarea>
      </div>

      <hr />

      <!-- Sélecteur de mode tâche -->
      <div class="btn-group btn-group-sm mb-3" role="group">
        <button
          type="button"
          class="btn"
          :class="mode === 'sans' ? 'btn-primary' : 'btn-outline-primary'"
          @click="switchMode('sans')"
        >
          Sans tâche
        </button>
        <button
          type="button"
          class="btn"
          :class="mode === 'mono' ? 'btn-primary' : 'btn-outline-primary'"
          @click="switchMode('mono')"
        >
          Monotâche
        </button>
        <button
          type="button"
          class="btn"
          :class="mode === 'multi' ? 'btn-primary' : 'btn-outline-primary'"
          @click="switchMode('multi')"
        >
          Multitâche
        </button>
      </div>

      <p v-if="mode === 'sans'" class="text-muted small">
        Ce contrôle ne comporte aucune tâche : seule la date d'exécution (et une remarque
        éventuelle) sera enregistrée à chaque passage.
      </p>

      <!-- Mode monotâche — UI simplifiée (nom/description du contrôle = ceux de la tâche) -->
      <template v-if="mode === 'mono'">
        <div class="row g-2 align-items-end">
          <div class="col-auto" style="width: 160px">
            <label class="form-label form-label-sm">Type de résultat</label>
            <select v-model="monoTache.type" class="form-select form-select-sm">
              <option value="BOOLEAN">OK / KO</option>
              <option value="NUMERIC">Numérique</option>
            </select>
          </div>
          <template v-if="monoTache.type === 'NUMERIC'">
            <div class="col-auto" style="width: 90px">
              <label class="form-label form-label-sm">Unité</label>
              <input
                v-model="monoTache.unit"
                type="text"
                class="form-control form-control-sm"
                placeholder="bar"
              />
            </div>
            <div class="col-auto" style="width: 90px">
              <label class="form-label form-label-sm">Min</label>
              <input
                v-model="monoTache.value_min"
                type="number"
                step="any"
                class="form-control form-control-sm"
              />
            </div>
            <div class="col-auto" style="width: 90px">
              <label class="form-label form-label-sm">Max</label>
              <input
                v-model="monoTache.value_max"
                type="number"
                step="any"
                class="form-control form-control-sm"
              />
            </div>
          </template>
        </div>
      </template>

      <!-- Mode multitâche — liste complète -->
      <template v-else-if="mode === 'multi'">
        <div v-for="(tache, idx) in taches" :key="tache._key" class="card mb-2">
          <div class="card-body py-2 px-3">
            <div class="row g-2 align-items-start">
              <div class="col-auto" style="width: 70px">
                <label class="form-label form-label-sm">Ordre</label>
                <input
                  ref="tache-ordre"
                  v-model.number="tache.order"
                  type="number"
                  min="1"
                  step="1"
                  class="form-control form-control-sm"
                />
              </div>
              <div class="col">
                <label class="form-label form-label-sm"
                  >Nom <span class="text-danger">*</span></label
                >
                <input
                  v-model="tache.nom"
                  type="text"
                  required
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors[`taches.${idx}.nom`] }"
                  placeholder="Nom de la tâche"
                />
              </div>
              <div class="col-auto" style="width: 160px">
                <label class="form-label form-label-sm">Type</label>
                <select v-model="tache.type" class="form-select form-select-sm">
                  <option value="BOOLEAN">OK / KO</option>
                  <option value="NUMERIC">Numérique</option>
                </select>
              </div>
              <template v-if="tache.type === 'NUMERIC'">
                <div class="col-auto" style="width: 90px">
                  <label class="form-label form-label-sm">Unité</label>
                  <input
                    v-model="tache.unit"
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="bar"
                  />
                </div>
                <div class="col-auto" style="width: 90px">
                  <label class="form-label form-label-sm">Min</label>
                  <input
                    v-model="tache.value_min"
                    type="number"
                    step="any"
                    class="form-control form-control-sm"
                  />
                </div>
                <div class="col-auto" style="width: 90px">
                  <label class="form-label form-label-sm">Max</label>
                  <input
                    v-model="tache.value_max"
                    type="number"
                    step="any"
                    class="form-control form-control-sm"
                  />
                </div>
              </template>
              <div class="col-auto d-flex align-items-end pb-1">
                <button
                  type="button"
                  class="btn btn-outline-danger btn-sm border-0"
                  :disabled="taches.length <= 1"
                  @click="removeTache(tache._key)"
                >
                  <font-awesome-icon :icon="['far', 'trash-alt']" />
                </button>
              </div>
            </div>
            <div class="row g-2 mt-1">
              <div class="col">
                <input
                  v-model="tache.description"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="Description (optionnel)"
                />
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-outline-primary" @click="addTache">
          <font-awesome-icon :icon="['fas', 'plus']" class="me-1" />
          Ajouter une tâche
        </button>
      </template>

      <hr />

      <!-- Types de matériel -->
      <h6 class="mb-2">Matériels concernés</h6>
      <base-table
        :fields="fieldsTypes"
        :data="selectedTypes"
        select-key="_key"
        :hide-download="true"
        no-data="Aucun type associé"
      >
        <template #type-select="{ rowData }">
          <base-select
            :ref="(el) => setTypeSelectRef(rowData._key, el)"
            v-model="rowData.materiel_type_id"
            :options="optionsPourLigne(rowData)"
            display-key="designation"
          />
        </template>
        <template #type-actions="{ rowData }">
          <button
            type="button"
            class="btn btn-outline-danger border-0"
            @click="removeSelectedType(rowData._key)"
          >
            <font-awesome-icon :icon="['far', 'trash-alt']" />
          </button>
        </template>
        <template #foot>
          <tr>
            <td colspan="2">
              <button type="button" class="btn btn-outline-primary" @click="addSelectedType()">
                Ajouter
                <font-awesome-icon size="1x" :icon="['far', 'plus-square']" />
              </button>
            </td>
          </tr>
        </template>
      </base-table>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" @click="closeModal">Fermer</button>
      <button type="submit" class="btn btn-primary" :disabled="saving">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </form>
</template>
