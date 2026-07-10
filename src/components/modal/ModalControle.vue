<script setup>
import { ref, reactive, watch, computed, nextTick, useTemplateRef } from "vue";
import { useControleStore } from "../../stores/materiel/Controle.js";
import { useMaterielTypeStore } from "../../stores/materiel/Type.js";
import { useModalStore } from "../../stores/common/Modal.js";

const { data } = defineProps({
  data: { type: Object, default: () => {} },
});

const materielTypeStore = useMaterielTypeStore();
await materielTypeStore.fetchMaterielTypes();

const store = useControleStore();
const { closeModal } = useModalStore();

const errors = ref({});
const saving = ref(false);

const form = reactive({
  id: data?.id ?? null,
  nom: data?.nom ?? "",
  description: data?.description ?? "",
  recurrence_type: data?.recurrence_type ?? "PERIODIQUE",
  recurrence_value: data?.recurrence_value ?? "",
  duree_preavis: data?.duree_preavis ?? "",
  externe: data?.externe ?? false,
  reparateur: data?.reparateur ?? "",
});

watch(
  () => form.recurrence_type,
  () => {
    form.recurrence_value = "";
    form.duree_preavis = "";
  },
);

// --- Mode monotâche / multitâche ---
const mode = ref((data?.taches?.length ?? 0) > 1 ? "multi" : "mono");

const switchMode = (newMode) => {
  if (newMode === "mono" && taches.value.length > 1) {
    taches.value = [taches.value[0]];
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

const typeSelectInputs = useTemplateRef("type-select");

const addSelectedType = () => {
  selectedTypes.value.push({ _key: mkTypeKey(), materiel_type_id: null });
  nextTick(() => {
    typeSelectInputs.value[typeSelectInputs.value.length - 1]?.focus();
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
    externe: form.externe,
    reparateur: form.reparateur || null,
    taches: taches.value.map((t) => ({
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
    saving.value = false;
  }
};
</script>

<template>
  <div>
    <div class="modal-header">
      <h5 class="modal-title">{{ form.id ? "Modifier" : "Ajouter" }} un contrôle</h5>
      <button type="button" class="btn-close" @click="closeModal"></button>
    </div>

    <div class="modal-body">
      <!-- Informations générales -->
      <div class="row mb-3">
        <div class="col-md-6">
          <label class="form-label">Nom <span class="text-danger">*</span></label>
          <input
            v-model="form.nom"
            type="text"
            class="form-control form-control-sm"
            :class="{ 'is-invalid': errors['nom'] }"
          />
          <div v-if="errors['nom']" class="invalid-feedback">
            {{ errors["nom"][0] }}
          </div>
        </div>
        <div class="col-md-3">
          <label class="form-label">Type de récurrence <span class="text-danger">*</span></label>
          <select v-model="form.recurrence_type" class="form-select form-select-sm">
            <option value="PERIODIQUE">Périodique</option>
            <option value="NON_PERIODIQUE">Non périodique</option>
            <option value="APRES_USAGE">Après usage</option>
          </select>
        </div>
        <div class="col-md-3">
          <template v-if="form.recurrence_type === 'PERIODIQUE'">
            <label class="form-label">Fréquence (mois) <span class="text-danger">*</span></label>
            <input
              v-model="form.recurrence_value"
              type="number"
              min="1"
              step="1"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['recurrence_value'] }"
              placeholder="Ex : 6"
            />
          </template>
        </div>
        <div v-if="form.recurrence_type === 'PERIODIQUE'" class="col-md-3">
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

      <!-- Mode monotâche — UI simplifiée (nom/description du contrôle = ceux de la tâche) -->
      <template v-if="mode === 'mono'">
        <div class="row g-2 align-items-end">
          <div class="col-auto" style="width: 160px">
            <label class="form-label form-label-sm">Type de résultat</label>
            <select v-model="monoTache.type" class="form-select form-select-sm">
              <option value="BOOLEAN">OK / NOK / NA</option>
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
      <template v-else>
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
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': errors[`taches.${idx}.nom`] }"
                  placeholder="Nom de la tâche"
                />
              </div>
              <div class="col-auto" style="width: 160px">
                <label class="form-label form-label-sm">Type</label>
                <select v-model="tache.type" class="form-select form-select-sm">
                  <option value="BOOLEAN">OK / NOK / NA</option>
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
            ref="type-select"
            v-model="rowData.materiel_type_id"
            :options="materielTypeStore.liste"
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
      <button type="button" class="btn btn-primary" :disabled="saving" @click="save">
        {{ form.id ? "Modifier" : "Ajouter" }}
      </button>
    </div>
  </div>
</template>
