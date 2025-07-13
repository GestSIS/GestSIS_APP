<script setup>
import { computed, inject, ref } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
await store.dispatch('fetchExcuseParams');

const excuseParams = computed(() => store.state.excuseParam.params);

const errors = ref({});
const params = ref({
  actif: false,
  delai_excuse: null,
  email_rappel: false,
  texte_email_rappel: '',
});

params.value = {
  ...params.value,
  ...excuseParams,
};

const awn = inject('awn');

const save = async () =>
  store
    .dispatch('updateExcuseParams', params.value)
    .then((res) => {
      errors.value = {};
      awn.success(res?.message || 'Modifications enregistrées');
    })
    .catch((e) => {
      errors.value = { ...e };
      awn.alert(e?.message || "Erreur lors de l'enregistrement");
    });
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">Paramètres pour excuses</h3>
          <button type="button" class="btn btn-primary" @click="save">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <div class="form-check form-switch">
              <input
                id="module-excuse"
                v-model="params.actif"
                class="form-check-input"
                type="checkbox"
                role="switch"
              />
              <label class="form-check-label" for="module-excuse"
                >Activer le module excuse<font-awesome-icon
                  v-tooltip.bottom="{
                    content:
                      'Les utilisateurs pourront saisir des excuses individuelles',
                  }"
                  class="ms-1"
                  :icon="['far', 'question-circle']"
              /></label>
            </div>
          </div>
          <div class="mb-3">
            <label for="delai_excuse"
              >Délai pour excuse [Jour]<font-awesome-icon
                v-tooltip.bottom="{
                  content:
                    'Nb jour disponible pour s\'excuser à partir de l\'exercice',
                }"
                class="ms-1"
                :icon="['far', 'question-circle']"
            /></label>
            <input
              id="delai_excuse"
              v-model="params.delai_excuse"
              type="number"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['delai_excuse'] }"
            />
          </div>
          <!-- <base-checkbox
            v-model="params.email_rappel"
            class="mb-3"
            label="Envoyer email si non excusé"
          />
          <div class="mb-3">
            <label for="texte_email_rappel"
              >Email rappel<font-awesome-icon
                v-tooltip.bottom="{
                  content: 'Envoyer un email de rappel pour demande d\'excuse',
                }"
                class="ms-1"
                :icon="['far', 'question-circle']"
            /></label>
            <textarea
              id="texte_email_rappel"
              v-model="params.texte_email_rappel"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['taux_ac'] }"
            />
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>
