<script setup>
import { computed, inject, ref, watch } from 'vue';
import { useAspsmsParamStore } from '../../stores/sms/AspsmsParam.js';

const aspsmsParamStore = useAspsmsParamStore();

const errors = ref({});
const params = ref({
  username: null,
  password: null,
});

const aspsmsParams = computed(() => aspsmsParamStore.params);
const credit = computed(() => aspsmsParamStore.credit);

watch(aspsmsParams, (value) => {
  if (value && value?.username && value?.password) {
    params.value = value;
  }
});

params.value = aspsmsParams.value ? aspsmsParams.value : params.value;

const awn = inject('awn');
const save = async () => {
  if (params.value.password === '********') {
    awn.success('Modifications enregistrées');
    return;
  }
  try {
    const res = await aspsmsParamStore.updateAspsmsParams({ ...params.value });
    errors.value = {};
    awn.success(res?.message || 'Modifications enregistrées');
  } catch (err) {
    errors.value = err;
    awn.alert(errors.value?.message || "Erreur lors de l'enregistrement");
  }
};
</script>

<template>
  <div class="row">
    <div class="col-12 col-xl-6">
      <div class="card card-primary card-outline">
        <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">ASPSMS</h3>
          <button type="button" class="btn btn-primary" @click="save">
            Enregistrer
          </button>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label for="user">Utilisateur</label>
            <input
              id="username"
              v-model="params.username"
              type="text"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['username'] }"
            />
          </div>
          <div class="mb-3">
            <label for="password">Mot de passe</label>
            <input
              id="password"
              v-model="params.password"
              type="password"
              class="form-control form-control-sm"
              :class="{ 'is-invalid': errors['password'] }"
            />
          </div>
          <div class="mb-3">
            <label for="credit">Crédit actuel</label>
            <input
              id="credit"
              type="number"
              readonly
              :value="credit"
              class="form-control form-control-sm"
            />
          </div>
          <div class="mb-3">
            <a href="https://www.aspsms.com/en/login/" target="_blank"
              >Recharger des crédits</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
